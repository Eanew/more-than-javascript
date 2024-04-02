const START_BUTTON = 'Enter'

const CHAR_ELEMENT_TAG = 'input'
const CHAR_ELEMENT_TYPE = 'text'
const CHAR_ELEMENT_ID_PREFIX = 'char_'

const TypeAlign = {
    CENTER: 'CENTER',
    START: 'START',
    END: 'END',
}

const OffsetMultiplier = {
    [TypeAlign.CENTER]: -0.5,
    [TypeAlign.START]: 0,
    [TypeAlign.END]: -1,
}

const screen = document.querySelector('.contentWrapper')
const textWrapper = screen.querySelector('.content')

let typeAlign = TypeAlign.CENTER
let caretIndex = 0
let textOffset = 0
let minSpeed = 0
let maxSpeed = 0
let typedChars = 0
let lastTypedChar = null

const getNumberByRange = (from, to = from) => from + Math.round(Math.random() * (to - from))

const getCharElements = index => {
    const charElements = Array.from(textWrapper.querySelectorAll(CHAR_ELEMENT_TAG))

    return typeof index === 'number' ? charElements[index] : charElements
}

const getLastChar = () => lastTypedChar

const getResult = () => getCharElements().reduce((result, {value}) => result + value, '')

const getCharWidth = () => {
    const textWrapperWidth = parseFloat(getComputedStyle(textWrapper).width)
    const materialCharsCount = getCharElements().filter(char => getComputedStyle(char).position !== 'absolute').length

    return textWrapperWidth / materialCharsCount || 0
}

const getRange = search => {
    if (!search) return [search, search]

    const result = getResult()
    const {0: text, index: start} = typeof search === 'string' ? result.match(search) : search.exec(result)
    const end = Math.max(start + text.length - 1, start)

    return [start, end]
}

const createChar = (value, classList = []) => {
    const id = CHAR_ELEMENT_ID_PREFIX + typedChars++
    const inputAttributes = {value, id, name: id, type: CHAR_ELEMENT_TYPE, tabIndex: -1, spellcheck: false}
    const char = Object.assign(document.createElement(CHAR_ELEMENT_TAG), inputAttributes)

    if (classList?.length) char.classList.add(...[].concat(classList))

    return char
}

const insertChar = (char, nextChar) => textWrapper[nextChar ? 'insertBefore' : 'appendChild'](char, nextChar)

const setCaret = char => {
    const index = getCharElements().findIndex(element => element === char)
    const caretPosition = char?.value.length

    textOffset += (index - caretIndex) * getCharWidth() * OffsetMultiplier[typeAlign]
    textWrapper.style.marginLeft = textOffset + 'px'
    caretIndex = index
    char?.focus()
    char?.setSelectionRange(caretPosition, caretPosition)
}

const jump = (to = getCharElements().length - 1) => {
    if (typeof to !== 'number') [, to] = getRange(to)

    const lastAlign = typeAlign

    typeAlign = TypeAlign.START
    setCaret(getCharElements(to))
    typeAlign = lastAlign
}

const typeText = (text, classList) => {
    const from = caretIndex + 1
    const nextChar = getCharElements(from)

    for (let index = from; index < from + text.length; index++) {
        lastTypedChar = createChar(text[index - from], classList)
        insertChar(lastTypedChar, nextChar)
        setCaret(lastTypedChar)
    }
}

const deleteText = (from = caretIndex - 1, to = from + 1) => {
    if (typeof from !== 'number') {
        [from, to] = getRange(from)
        from--
    }

    for (let index = to; index > from; index--) {
        const char = getCharElements(index)
        const previousChar = getCharElements(index - 1)

        char?.remove()
        setCaret(previousChar)
    }
}

const replaceText = (current, update, classList) => {
    deleteText(current)
    typeText(update, classList)
}

const parseSpeed = (min, max = min) => typeof min !== 'number' ? [minSpeed, maxSpeed] : [min, max]

const defer = (action, min, max) => new Promise(resolve => {
    setTimeout(() => {
        action()
        resolve()
    }, getNumberByRange(min, max))
})

const preventAction = event => event.preventDefault()

const text = {
    async type(text, classList, min, max) {
        ;[min, max] = parseSpeed(min, max)

        if (min === 0 && max === 0) return typeText(text, classList)

        for (const char of text) {
            await defer(() => typeText(char, classList), min, max)
        }
    },

    async delete(text, min, max) {
        let [from = caretIndex - 1, to = from + 1] = getRange(text)

        from -= Boolean(text)
        ;[min, max] = parseSpeed(min, max)

        if (min === 0 && max === 0) return deleteText(from, to)

        for (let index = to; index > from; index--) {
            await (bindedIndex => defer(() => deleteText(bindedIndex - 1), min, max))(index)
        }
    },

    async replace(current, update, classList, min, max) {
        ;[min, max] = parseSpeed(min, max)

        if (min === 0 && max === 0) return replaceText(current, update, classList)

        await text.delete(current, min, max)
        await text.type(update, classList, min, max)
    },

    async jump(text, min, max) {
        const [, to = getCharElements().length - 1] = getRange(text)

        ;[min, max] = parseSpeed(min, max)

        if (min === 0 && max === 0) return jump(to)

        const isNegative = to < caretIndex
        const isContinues = index => isNegative ? (index >= to) : (index <= to)
        const direction = isNegative ? -1 : 1

        for (let index = caretIndex; isContinues(index); index += direction) {
            await (bindedIndex => defer(() => jump(bindedIndex), min, max))(index)
        }
    },

    async pause(min, max) {
        await defer(() => {}, min, max)
    },

    clear() {
        getCharElements().forEach(char => char.remove())
    },

    blur() {
        lastTypedChar.blur()
    },

    align: {
        center: () => {typeAlign = TypeAlign.CENTER},
        start: () => {typeAlign = TypeAlign.START},
        end: () => {typeAlign = TypeAlign.END},
    },

    setSpeed(min, max = min) {
        minSpeed = min
        maxSpeed = max
    },
}

const mouseMoveHandler = () => {
    screen.style.cursor = 'default'
    screen.removeEventListener('mousemove', mouseMoveHandler)
}

const start = async (action) => {
    const startKeyPressHandler = event => {
        if (event.key !== START_BUTTON) return

        text.clear()
        document.removeEventListener('keypress', startKeyPressHandler)

        screen.requestFullscreen().then(() => {
            screen.style.cursor = 'none'
            setTimeout(() => screen.addEventListener('mousemove', mouseMoveHandler), 1000)
            action()
        })
    }
    
    await text.type('Press ' + START_BUTTON, [], 0)

    text.blur()
    document.addEventListener('keypress', startKeyPressHandler)
}

textWrapper.addEventListener('keydown', preventAction)
textWrapper.addEventListener('keypress', preventAction)

textWrapper.focus()
text.setSpeed(200, 700)

export {getCharElements, getLastChar, getCharWidth, getResult, getNumberByRange, start, text}
