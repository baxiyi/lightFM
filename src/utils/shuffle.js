export default arr => {
    let input = arr;
    for(let i = input.length - 1; i>=0; i--){
        let randomIndex = Math.floor(Math.random()*(i+1));
        let temp = input[randomIndex];
        input[randomIndex] = input[i];
        input[i]=temp;
    }
    return input;
}
