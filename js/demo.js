import {getCharElements, getCharWidth, getLastChar, getNumberByRange, start, text} from './main.js'

const HEX_INIT_UNIT = '#'
const HEX_COLORS_COUNT = 3
const COLOR_VALUE_RANGE = [0, 190]
const FADE_INTERVAL = 200

const Effect = {
    HEART: 'heart',
    ITALIC: 'italic',
    OFFSET: 'offset',
    FADE_UP: 'fadeUp',
    FADE_DOWN: 'fadeDown',
    YELLOW: 'yellow',
    BOLD: 'bold',
    PULSE: 'pulse',
}

const FadeDirection = {
    UP: Effect.FADE_UP,
    DOWN: Effect.FADE_DOWN,
}

const thingsThatILove = [
    'buckwheat',
    'stickers with cats',
    'crying',
    'watching the sunrise before bed',
    'carrot',
    'Gravity Falls',
    'strong coffee',
    'Tie Guan Yin',
    'World of Warcraft',
    'snow',
    'other foxes',
    'night',
    'Avril Lavigne',
    'thunderstorm',
    'skating',
    'cashew',
    'flowers',
    'discipline',
    'sea in winter',
    'fear',
    'psychology',
    'water',
    'singing along to Paramore',
    'wind',
    'complicating everything',
]

const defaultTypeSpeed = [100, 200]

let fadeDirection = FadeDirection.UP

const toggleFadeDirection = () => {
    fadeDirection = fadeDirection === FadeDirection.UP ? FadeDirection.DOWN : FadeDirection.UP

    return fadeDirection
}

const generateRandomColor = () => {
    let result = HEX_INIT_UNIT

    for (let index = 0; index < HEX_COLORS_COUNT; index++) result += getNumberByRange(...COLOR_VALUE_RANGE).toString(16)

    return result
}

const fade = async (chars, direction) => {
    const charWidth = getCharWidth()
    const charsColor = generateRandomColor()

    for (let index = 0; index < chars.length; index++) {
        await text.type(chars[index], [direction, Effect.OFFSET], 40)

        const char = getLastChar()

        char.style.right = -(charWidth * (index + 1)) + 'px'
        char.style.color = charsColor
        setTimeout(() => char.remove(), parseFloat(getComputedStyle(char).animationDuration) * 1000)
    }

    text.blur()

    await text.pause(FADE_INTERVAL)
}

const pulse = () => {
    const chars = getCharElements()

    for (let index = 0; index < chars.length; index++) {
        setTimeout(() => {
            chars[index].classList.add(Effect.PULSE)
        }, (chars.length - index) * 15);
    }
}

start(async () => {
    text.setSpeed(...defaultTypeSpeed)

    await text.type('I', '', 500)
    await text.pause(1000)
    await text.type(' l')
    await text.type('❤', Effect.HEART)
    await text.type('ve you')
    await text.pause(300)

    text.align.end()

    await text.type(' more than')

    text.align.start()

    await text.pause(800)
    await text.type('..', '', 500)
    await text.pause(1200)
    await text.delete()
    await text.delete()
    await text.type(' ')
    await text.pause(600)

    for (const thing of thingsThatILove) await fade(thing, toggleFadeDirection())

    await text.pause(1500)
    await text.jump('than ', 0)
    await text.jump('you ', 40, 100)

    // text.align.end()
    
    await text.type('even ', Effect.ITALIC, 500)
    await text.jump('than ', 50)
    await text.pause(300)
    
    text.align.center()

    await text.type('Java', Effect.BOLD, 100)
    await text.type('Script', [Effect.BOLD, Effect.YELLOW], 100)

    pulse()
})
