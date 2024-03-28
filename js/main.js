// TODO: Функция рандомизации временных промежутков во время печати.
// TODO: Функции-обёртки над typeText, deleteText, jump для задания временных промежутков во время печати.
// TODO: Массив "что я люблю".
// TODO: Демо.
// TODO: Возможность изменять классы существующих символов без путешествий каретки.
// TODO: Подсказка с переводом на русский язык при наведении на текст.

const CHAR_ELEMENT_TAG = 'input'
const CHAR_ELEMENT_TYPE = 'text'
const CHAR_ELEMENT_ID_PREFIX = 'char_'

const Class = {
    EMPTY: '',
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
let typedChars = 0

const getCharElements = index => {
    const charElements = Array.from(textWrapper.querySelectorAll(CHAR_ELEMENT_TAG))

    return typeof index === 'number' ? charElements[index] : charElements
}

const getResult = () => getCharElements().reduce((result, {value}) => result + value, '')

const getCharWidth = () => parseFloat(getComputedStyle(textWrapper).width) / getResult().length || 0

const getRange = text => {
    const start = getResult().match (text)?.index
    const end = Math.max(start + text.length - 1, start)

    return [start, end]
}

const createChar = (value, classList = Class.EMPTY) => {
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
    if (typeof to === 'string') [, to] = getRange(to)

    const lastAlign = typeAlign

    typeAlign = TypeAlign.START
    setCaret(getCharElements(to))
    typeAlign = lastAlign
}

const typeText = (text, classList = Class.EMPTY) => {
    const from = caretIndex + 1
    const nextChar = getCharElements(from)

    let lastChar

    for (let index = from; index < from + text.length; index++) {
        lastChar = createChar(text[index - from], classList)
        insertChar(lastChar, nextChar)
        setCaret(lastChar)
    }

    return lastChar
}

const deleteText = (from = caretIndex - 1, to = from + 1) => {
    if (typeof from === 'string') {
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

const replaceText = (currentText, replacement, classList = Class.EMPTY) => {
    deleteText(currentText)
    typeText(replacement, classList)
}

const align = {
    center: () => (typeAlign = TypeAlign.CENTER),
    start: () => (typeAlign = TypeAlign.START),
    end: () => (typeAlign = TypeAlign.END),
}

const preventAction = event => event.preventDefault()

textWrapper.addEventListener('keydown', preventAction)
textWrapper.addEventListener('keypress', preventAction)
textWrapper.focus()

// <tests>

const text = 'I l❤ve you even more than JavaScript'

let time = 0
let speed = 0

setTimeout(() => typeText(text[0]), time += speed)
setTimeout(() => typeText(text[1]), time += speed)
setTimeout(() => typeText(text[2]) || align.end(), time += speed)
setTimeout(() => typeText(text[3], Class.HEART).blur(), time += speed)
setTimeout(() => typeText(text[4]), time += speed)
setTimeout(() => typeText(text[5]), time += speed)
speed = 600
setTimeout(() => deleteText(), time += speed)
setTimeout(() => typeText(text[5]) || align.start(), time += speed)
setTimeout(() => typeText(' you'), time += speed)
setTimeout(() => typeText(' more') || align.center(), time += speed)
setTimeout(() => typeText(' than'), time += speed)
setTimeout(() => deleteText('❤'), time += speed)
setTimeout(() => deleteText(' than'), time += speed)
setTimeout(() => align.end(), time += speed)
setTimeout(() => typeText(' than'), time += speed)
setTimeout(() => jump('you '), time += speed)
setTimeout(() => typeText('even '), time += speed)
setTimeout(() => jump(), time += speed)
setTimeout(() => replaceText(' than', ' than JavaScript'), time += speed)
setTimeout(() => jump('I l'), time += speed)
setTimeout(() => typeText('❤', Class.HEART).blur(), time += speed)
setTimeout(() => jump(0), time += speed)
setTimeout(() => align.start(), time += speed)
setTimeout(() => deleteText(), time += speed)
setTimeout(() => typeText('I'), time += speed)

// </tests>
