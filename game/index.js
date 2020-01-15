// In renderer process (web page).
const { ipcRenderer } = require('electron')


function naughts_and_crosses(){
    index = JSON.parse("[" + this.value + "]")
    game_state[index[0]][index[1]] = turn

    this.innerHTML = turn
    this.onclick = ""

    swap_whos_turn()

    turn_label.innerHTML = "It is '" + turn + "'s go."

    outcome = check_win(index)
    if (outcome["result"]){
        game_state_label.innerHTML = outcome["message"]
        turn_label.innerHTML = "Game Complete, Press to play again. " + play_again_button
        for (let i = 0; i < game_buttons.length; i++){
            game_buttons[i].onclick = ""
        }
    }

}

function swap_whos_turn(){
    if (turn == "0"){
        turn = "X"
    }
    else if (turn == "X"){
        turn = "0"
    }
}

function check_win(check_from){
    let result = false
    let message = "No one has won yet."
    let x = check_from[0]
    let y = check_from[1]

    for (let d_idx = 0; d_idx < directions.length; d_idx++){
        let length = check_directions(game_state, directions[d_idx], [x, y], game_state[x][y])
        if (length == 3){
            let winner = game_state[x][y]
            message = winner + " has won the game!"
            result = true
            console.log(winner + " won the game!")

            x, y, d_idx = 10000
        }
    }
    return {"result": result, "message": message}
}

function check_directions(game_state, direction, current_position, current_value){    
    let length = 1
    let new_index = [current_position[0] + direction[0], current_position[1] + direction[1]]
    if (new_index[0] in game_state) {
        if (new_index[1] in game_state[new_index[0]]){
            let new_value = game_state[new_index[0]][new_index[1]]
            if (new_value === current_value){
                length += check_directions(game_state, direction, new_index, new_value)
            }
        }
    }
    return length
}

let turn = "0"

let game_state = [["1", "2", "3"],
                  ["4", "5", "6"],
                  ["7", "8", "9"]]

let directions = [[-1, 0],
                  [-1, 1],
                  [0, 1],
                  [1, 1],
                  [1, 0],
                  [1, -1],
                  [0, -1],
                  [-1, -1]]

let play_again_button = "<button onclick='window.location.reload()'>Play Again</button>"
