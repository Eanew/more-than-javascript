// TODO: Проверка на min = 0 и max = 0 для мгновенных действий за 1 рендер.
// TODO: Массив "что я люблю".
// TODO: Демо.
// TODO: Возможность изменять классы существующих символов без путешествий каретки.
// TODO: Подсказка с переводом на русский язык при наведении на текст.

const CHAR_ELEMENT_TAG = 'input'
const CHAR_ELEMENT_TYPE = 'text'
const CHAR_ELEMENT_ID_PREFIX = 'char_'

const Class = {
    DEFAULT: '',
    HEART: 'heart',
}

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

const textWrapper = document.querySelector('.content')

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

const getResult = () => getCharElements().reduce((result, {value}) => result + value, '')

const getCharWidth = () => parseFloat(getComputedStyle(textWrapper).width) / getResult().length || 0

const getRange = search => {
    if (!search) return [search, search]

    const result = getResult()
    const {0: text, index: start} = typeof search === 'string' ? result.match(search) : search.exec(result)
    const end = Math.max(start + text.length - 1, start)

    return [start, end]
}

const createChar = (value, classList = Class.DEFAULT) => {
    const id = CHAR_ELEMENT_ID_PREFIX + typedChars++
    const inputAttributes = {value, id, name: id, type: CHAR_ELEMENT_TYPE, tabIndex: -1}
    const char = Object.assign(document.createElement(CHAR_ELEMENT_TAG), inputAttributes)

    if (classList) char.classList.add(...[].concat(classList))

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

const typeText = (text, classList = Class.DEFAULT) => {
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

const replaceText = (current, update, classList = Class.DEFAULT) => {
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
        ;[min, max] = parseSpeed(min, max)
        ;[from = caretIndex - 1, to = from + 1] = getRange(text)
        from -= Boolean(text)

        if (min === 0 && max === 0) return deleteText(from, to)

        for (let index = to; index > from; index--) {
            await (bindedIndex => defer(() => deleteText(bindedIndex - 1), min, max))(index)
        }
    },

    async replace(current, update, classList, min, max) {
        ;[min, max] = parseSpeed(min, max)

        if (min === 0 && max === 0) return replaceText(current, update, classList)

        await this.delete(current, min, max)
        await this.type(update, classList, min, max)
    },

    async jump(text, min, max) {
        ;[min, max] = parseSpeed(min, max)
        ;[, to = getCharElements().length - 1] = getRange(text)

        if (min === 0 && max === 0) return jump(to)

        const isNegative = to < caretIndex
        const isContinues = index => isNegative ? (index >= to) : (index <= to)
        const direction = isNegative ? -1 : 1

        for (let index = caretIndex; isContinues(index); index += direction) {
            await (bindedIndex => defer(() => jump(bindedIndex), min, max))(index)
        }
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

textWrapper.addEventListener('keydown', preventAction)
textWrapper.addEventListener('keypress', preventAction)
textWrapper.focus()
text.setSpeed(200, 700)

// <tests>

const testText = 'I l❤ve you even more than JavaScript'

const start = async () => {
    text.setSpeed(200, 400)
    await text.type(testText[0])
    await text.type(testText[1])
    await text.type(testText[2])
    text.align.end()
    await text.type(testText[3], Class.HEART)
    text.blur()
    await text.type(testText[4])
    await text.type(testText[5])
    await text.delete(/e/)
    await text.delete()
    await text.type(testText[4])
    await text.type(testText[5])
    text.align.start()
    await text.type(' you')
    await text.type(' more')
    text.align.center()
    await text.type(' than')
    await text.delete('❤')
    await text.delete(' than')
    text.align.end()
    await text.type(' than')
    await text.jump('you ')
    await text.type('even ')
    await text.jump()
    await text.replace(' than', ' than JavaScript', Class.DEFAULT, 200, 500)
    await text.replace(' than JavaScript', ' than')
    await text.replace(' than', ' than JavaScript')
    await text.jump(/I l/)
    // text.setSpeed(500) // debug
    await text.type('❤', Class.HEART)
    text.blur()
    await text.jump('I')
    await text.jump('you ')
    await text.jump('I')
    text.align.start()
    await text.delete()
    await text.type('I')
    await text.jump()
}

start()

// </tests>
