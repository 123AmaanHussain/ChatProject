const keyStrokeSounds = [
    new Audio("/sounds/keystroke1.mp3"),
    new Audio("/sounds/keystroke2.mp3"),
    new Audio("/sounds/keystroke3.mp3"),
    new Audio("/sounds/keystroke4.mp3"),
    
];

function usekeyboardSound(){
    const playRandomStrokeSound = () => {
        const randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];
        randomSound.currentTime = 0;  //this is for a better UX
        randomSound.play().catch(error => console.log("Audio play failed:",error));
    }

    return {playRandomStrokeSound};
}

export default usekeyboardSound