// In renderer process (web page).
const ipcRenderer = require('electron')
const request = require('request');


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


function naughts_and_crosses(){
    index = JSON.parse("[" + this.value + "]")
    game_state[index[0]][index[1]] = turn

    this.innerHTML = turn
    this.onclick = ""

    swap_whos_turn()
    turn_label.innerHTML = "It is '" + turn + "'s go."

    if (check_win(game_state, index)){
        return
    }

    if (play_ai.checked){
        get_q_learnings_turn_decision(game_state, function(turn_decision){
            console.log(turn_decision)
            q_learning_turn(game_state, turn_decision)
            swap_whos_turn()
        })
    }
}

function q_learning_turn(game_state, turn_decision){
    y = parseInt(turn_decision["y"])
    x = parseInt(turn_decision["x"])

    game_state[y][x] = turn
    button_number = (y * game_state[0].length) + x
    game_buttons[button_number].innerHTML = turn
    game_buttons[button_number].onclick = ""

    button_index = JSON.parse("[" + game_buttons[button_number].value + "]")
    check_win(game_state, button_index)
}

function get_q_learnings_turn_decision(game_state, callback){
    request.post("http://127.0.0.1:5000/q_learning/", {form:{"game_state": JSON.stringify(game_state)}},
                 function (error, response, body){
                        callback(JSON.parse(body))
                    })
}

function swap_whos_turn(){
    if (turn == "0"){
        turn = "X"
    }
    else if (turn == "X"){
        turn = "0"
    }
}

function check_win(game_state, check_from){
    let result = false
    let message = "No one has won yet."
    let x = check_from[0]
    let y = check_from[1]
    
    for (let d_idx = 0; d_idx < directions.length; d_idx++){
        let length = 1
        length += check_directions(game_state, directions[d_idx], [x, y], game_state[x][y])
        length += check_directions(game_state, [(directions[d_idx][0] * -1), (directions[d_idx][1] * -1)], [x, y], game_state[x][y])

        if (length == 3){
            let winner = game_state[x][y]
            message = winner + " has won the game!"
            result = true
            console.log(winner + " won the game!")
            game_state_label.innerHTML = message
            turn_label.innerHTML = "Game Complete, Press to play again. " + play_again_button
            for (let i = 0; i < game_buttons.length; i++){
                game_buttons[i].onclick = ""
            }
            x, y, d_idx = 10000
        }
    }
    let counter = 0
    for (let x = 0; x < game_state.length; x++){
        for (let i = 0; i < game_state[x].length; i++){
            if (game_state[x][i] == "X" || game_state[x][i] == "0"){
                counter += 1
            }
        }
    }
    if (counter >= 9){
        result = true
        turn_label.innerHTML = "No one Won, Press to play again. " + play_again_button
    }
    return result
}

function check_directions(game_state, direction, current_position, current_value){    
    let length = 0
    let new_index = [current_position[0] + direction[0], current_position[1] + direction[1]]
    if (new_index[0] in game_state) {
        if (new_index[1] in game_state[new_index[0]]){
            let new_value = game_state[new_index[0]][new_index[1]]
            if (new_value === current_value){
                length += 1
                length += check_directions(game_state, direction, new_index, new_value)
            }
        }
    }
    return length
}
