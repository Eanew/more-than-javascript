import {Class, getCharElements, getResult, getNumberByRange, textWrapper, text} from './main.js'

// TODO: Массив "что я люблю".
// TODO: Демо.

const iLove = [
    'buckwheat',
]

const start = async () => {

}

start()

// <tests>

const testText = 'I l❤ve you even more than JavaScript'

const startTest = async () => {
    text.setSpeed(500)
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
    await text.pause(500)
    await text.replace(' than JavaScript', ' than')
    await text.pause(500)
    await text.replace(' than', ' than JavaScript')
    await text.pause(500)
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

// startTest()

// </tests>
