const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const fetch = require('node-fetch');

const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', async (message) => {
    const body = message.body.toLowerCase();

    if (body === '!ping') {
        await message.reply('pong');
    } else if (body === '!joke') {
        const joke = await fetchJson('https://official-joke-api.appspot.com/random_joke');
        await message.reply(`${joke.setup}\n${joke.punchline}`);
    } else if (body === '!funfact') {
        const funfact = await fetchJson('https://uselessfacts.jsph.pl/api/v2/facts/random');
        await message.reply(funfact.text);
    } else if (body === '!gaylvl') {
        const gaylvl = Math.floor(Math.random() * 100) + 1;
        await message.reply(`Tingkat Gay kamu : ${gaylvl}%`);
    } else if (body === '!help') {
        const listCommands = [
            '!ping - pong',
            '!joke - random joke',
            '!funfact - random fun fact',
            '!gaylvl - Seberapa Gay Kamu?'
        ];
        await message.reply(listCommands.join('\n'));
    } else if (isMediaMessage(message) || isStickerCommand(message)) {
        await handleMediaMessage(message);
    } else if (isStickerToImageCommand(message)) {
        await handleStickerToImageCommand(message);
    } else if (isStickerMessage(message)) {
        await handleStickerMessage(message);
    } else if (isImageToStickerCommand(message)) {
        await handleImageToStickerCommand(message);
    } else {
        await markChatAsRead(message);
    }
});

client.initialize();

async function fetchJson(url) {
    const response = await fetch(url);
    return await response.json();
}

function isMediaMessage(message) {
    return ['image', 'video', 'gif'].includes(message.type) || message._data.caption === `${config.prefix}sticker`;
}

function isStickerCommand(message) {
    return message.body === `${config.prefix}sticker`;
}

async function handleMediaMessage(message) {
    client.sendMessage(message.from, '*[⏳]* Loading..');
    try {
        const media = await message.downloadMedia();
        await client.sendMessage(message.from, media, {
            sendMediaAsSticker: true,
            stickerName: 'JarvisBot',
            stickerAuthor: 'JarvisBot'
        });
        await client.sendMessage(message.from, '*[✅]* Successfully!');
    } catch {
        await client.sendMessage(message.from, '*[❎]* Failed!');
    }
}

function isStickerToImageCommand(message) {
    return message.body === `${config.prefix}image`;
}

async function handleStickerToImageCommand(message) {
    const quotedMsg = await message.getQuotedMessage();
    if (message.hasQuotedMsg && quotedMsg.hasMedia) {
        client.sendMessage(message.from, '*[⏳]* Loading..');
        try {
            const media = await quotedMsg.downloadMedia();
            await client.sendMessage(message.from, media);
            await client.sendMessage(message.from, '*[✅]* Successfully!');
        } catch {
            await client.sendMessage(message.from, '*[❎]* Failed!');
        }
    } else {
        await client.sendMessage(message.from, '*[❎]* Reply Image First!');
    }
}

function isStickerMessage(message) {
    return message.type === 'sticker';
}

async function handleStickerMessage(message) {
    client.sendMessage(message.from, '*[⏳]* Loading..');
    try {
        const media = await message.downloadMedia();
        await client.sendMessage(message.from, media);
        await client.sendMessage(message.from, '*[✅]* Successfully!');
    } catch {
        await client.sendMessage(message.from, '*[❎]* Failed!');
    }
}

function isImageToStickerCommand(message) {
    return message.body === `${config.prefix}sticker`;
}

async function handleImageToStickerCommand(message) {
    const quotedMsg = await message.getQuotedMessage();
    if (message.hasQuotedMsg && quotedMsg.hasMedia) {
        client.sendMessage(message.from, '*[⏳]* Loading..');
        try {
            const media = await quotedMsg.downloadMedia();
            await client.sendMessage(message.from, media, {
                sendMediaAsSticker: true,
                stickerName: 'sticker',
                stickerAuthor: 'sticker'
            });
            await client.sendMessage(message.from, '*[✅]* Successfully!');
        } catch {
            await client.sendMessage(message.from, '*[❎]* Failed!');
        }
    } else {
        await client.sendMessage(message.from, '*[❎]* Reply Sticker First!');
    }
}

async function markChatAsRead(message) {
    const chat = await client.getChatById(message.id.remote);
    await chat.sendSeen();
}