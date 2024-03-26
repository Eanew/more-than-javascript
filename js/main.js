// TODO: Невидимый пробел в конце и смещение ВСЕХ формул на 1 символ (независимая от анимаций каретка).
// TODO: Функция-обёртка над typeText для задания временных промежутков между вводом символов.
// TODO: Возможность изменять классы существующих символов без путешествий каретки.
// TODO: Путешествие каретки без изменения текста (имитация навигации).
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
    const start = getResult().match(text)?.index
    const end = start + text.length

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
    if (!char) return

    const index = getCharElements().findIndex(element => element === char)
    const [, caretPosition] = getRange(char.value)

    textOffset += (index - caretIndex) * getCharWidth() * OffsetMultiplier[typeAlign]
    textWrapper.style.marginLeft = textOffset + 'px'
    caretIndex = index
    char.focus()
    char.setSelectionRange(caretPosition, caretPosition)
}

const typeText = (text, classList = Class.EMPTY, from = caretIndex + 1) => {
    if (typeof from === 'string') [, from] = getRange(from)

    const nextChar = getCharElements(from)

    for (let index = from; index < from + text.length; index++) {
        const char = createChar(text[index - from], classList)

        insertChar(char, nextChar)
        setCaret(char)
    }
}

const deleteText = (from = caretIndex, to = from + 1) => {
    if (typeof from === 'string') [from, to] = getRange(from)

    for (let index = to; index > from; index--) {
        const char = getCharElements(index - 1)
        const previousChar = getCharElements(index - 2)

        char.remove()
        setCaret(previousChar)
    }
}

const replaceText = (currentText, replacement, classList = Class.EMPTY) => {
    const [from, to] = getRange(currentText)

    deleteText(from, to)
    typeText(replacement, classList, from)
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

const speed = 500
const text = 'I l❤ve you even more than JavaScript'

let time = 0

setTimeout(() => typeText(text[0]), time += speed)
setTimeout(() => typeText(text[1]), time += speed)
setTimeout(() => typeText(text[2]) || align.end(), time += speed)
setTimeout(() => typeText(text[3], Class.HEART), time += speed)
setTimeout(() => typeText(text[4]), time += speed)
setTimeout(() => typeText(text[5]), time += speed)
setTimeout(() => deleteText(), time += speed)
setTimeout(() => typeText(text[5]) || align.start(), time += speed)
setTimeout(() => typeText(' you'), time += speed)
setTimeout(() => typeText(' more') || align.center(), time += speed)
setTimeout(() => typeText(' than'), time += speed)
setTimeout(() => deleteText(' than'), time += speed)
setTimeout(() => replaceText(' more', ' even more'), time += speed)
setTimeout(() => typeText(' than JavaScript'), time += speed)

// </tests>
