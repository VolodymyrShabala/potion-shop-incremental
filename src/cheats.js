window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
        return;
    }

    if (e.ctrlKey && e.shiftKey && e.code === 'KeyG') {
        e.preventDefault();

        for (const currency of Object.values(window.game.currencies)) {
            currency.amount.value += 1_000;
        }

        console.log('DEV CHEAT: +1_000 to all currencies');
    }
});
