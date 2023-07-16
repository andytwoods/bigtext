let text, container;
const max_size = 200;
const buffer_width = 10;
document.addEventListener("DOMContentLoaded", function (event) {
    text = document.getElementById('my_input');
    reset_txt();
    container = document.getElementById('my_input_parent');
    welcome("Making it easier to chat\n with people around you");

    text.addEventListener('input', function () {
        resize();
    })
});

function reset_txt() {
    text.value = '';
    text.style.fontSize = max_size + 'px';
}

function welcome(txt) {
    var click_el, touch_el;
    var enabled = true;

    function cleanup() {
        if (enabled) {
            text.removeEventListener('click', click_el);
            text.removeEventListener('touch', touch_el);
            reset_txt();
            enabled = false;
        }
    }

    click_el = text.addEventListener('click', cleanup);
    touch_el = text.addEventListener('touch', cleanup);

    var do_continue = true;
    var chars = txt.split('');

    function wait_add_char(char) {
        var wait = Math.random() * 50 + 5;
        setTimeout(function () {
            if (do_continue) {
                text.value += char;
                resize();
                if (chars.length > 0) {
                    wait_add_char(chars.shift());
                }
            }
        }, wait);
    }

    wait_add_char(chars.shift());
}

//below mostly from https://stackoverflow.com/a/21015393
function getTextWidth(my_text) {
    const font = getCanvasFont(text);
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(my_text);
    return metrics.width;
}

function getCssStyle(element, prop) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}

function getCanvasFont(el = document.body) {
    const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
    const fontSize = getCssStyle(el, 'font-size') || '16px';
    const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';

    return `${fontWeight} ${fontSize} ${fontFamily}`;
}

//

function resize() {


    function lines() {
        return text.value.split(/\n+/g);
    }

    function size_x_lines() {
        return lines().map(function (line) {
            return {pixels: getTextWidth(line), text: line}
        });
    }

    function get_font_size() {
        var style = window.getComputedStyle(text, null).getPropertyValue('font-size');
        return parseFloat(style);
    }

    function get_longest_line() {
        let longest_line = 0;
        let line;
        for (let obj of size_x_lines()) {
            if (longest_line < obj['pixels']) {
                longest_line = obj['pixels'];
                line = obj['text'];
            }
        }
        return line;
    }

    function do_scale_down() {
        var resized = false;
        const line = get_longest_line();
        while (getTextWidth(line) + buffer_width > container.offsetWidth) {
            text.style.fontSize = (get_font_size() - 1) + 'px';
            resized = true;
        }
        return resized;
    }

    do_scale_down();
}


// Initialize deferredPrompt for use later to show browser install prompt.
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    showInstallPromotion();
    // Optionally, send analytics event that PWA install promo was shown.
    console.log(`'beforeinstallprompt' event was fired.`);
});


document.getElementById('install-button').addEventListener('click', async () => {
    // Hide the app provided install promotion
    // Show the install prompt
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // Optionally, send analytics event with outcome of user choice
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
    // Hide the app-provided install promotion
    // Clear the deferredPrompt so it can be garbage collected
    deferredPrompt = null;
    // Optionally, send analytics event to indicate successful install
    console.log('PWA was installed');
});

