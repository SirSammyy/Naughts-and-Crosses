// This script automatically trains the q_learning ai, it does this by utilising another ai to take the role of the player,
// this results in both learning at the same time.
const request = require('request');
var colors = require("colors")

let count_results = {"X": 0, "0": 0, "draw": 0}

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

let game_buttons = ["0,0",
                    "0,1",
                    "0,2",
                    "1,0",
                    "1,1",
                    "1,2",
                    "2,0",
                    "2,1",
                    "2,2"]

let total_training = 10000
let quasi_port = "5000"
let edward_port = "5001"

main()

async function main(){
    for (let x = 0; x < total_training; x++){
        await resetGameState()
        console.log(colors.red("Training iteration " + x + "/" + total_training))
        console.log(count_results)
        let gameOngoing = true

        while(gameOngoing == true){
            // Edward goes first
            console.log(colors.green("Edwards Turn"))
            turn_decision = await get_q_learnings_turn_decision(game_state, edward_port)
            button_index = q_learning_turn(game_state, turn_decision)
            game_result = check_win(game_state, button_index)

            if (game_result != ""){
                count_results[game_result] += 1
                await post_result_to_q_learning(game_result, edward_port)
                await post_result_to_q_learning(game_result, quasi_port)
                gameOngoing = false
                continue
            }  
            swap_whos_turn()
            // wait()

            // Quasi goes second
            console.log(colors.cyan("Quasis Turn"))
            turn_decision = await get_q_learnings_turn_decision(game_state, quasi_port)
            button_index = q_learning_turn(game_state, turn_decision)
            game_result = check_win(game_state, button_index)

            if (game_result != ""){
                count_results[game_result] += 1
                await post_result_to_q_learning(game_result, quasi_port)
                await post_result_to_q_learning(game_result, edward_port)
                gameOngoing = false
                continue
            }                   
            swap_whos_turn()
            // wait()
        }
    }
}

function resetGameState(){
    game_state = [["1", "2", "3"],
                  ["4", "5", "6"],
                  ["7", "8", "9"]]
    return new Promise(function(resolve, reject){
        resolve()
    })
}

function wait(){
    var waitTill = new Date(new Date().getTime() + 0.5 * 1000);
    while(waitTill > new Date()){}
}

function q_learning_turn(game_state, turn_decision){
    y = parseInt(turn_decision["y"])
    x = parseInt(turn_decision["x"])
    
    game_state[y][x] = turn
    button_number = (y * game_state[0].length) + x
    button_index = JSON.parse("[" + game_buttons[button_number] + "]")
    return button_index
}

function get_q_learnings_turn_decision(game_state, ip){
    return new Promise(function(resolve, reject){
        request.post("http://127.0.0.1:" + ip + "/q_learning/", {form:{"game_state": JSON.stringify(game_state)}},
                     function (error, response, body){
                         resolve(JSON.parse(body))
                     })
    })

}

function post_result_to_q_learning(result, ip){
    return new Promise(function(resolve, reject){
        request.post("http://127.0.0.1:" + ip + "/q_learning/result/", {form:{"result": result}})
        resolve()
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
    let result = ""
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
            result = winner
            console.log(colors.rainbow(winner + " won the game!"))
            x, y, d_idx = 10000
        }
    }
    if (result == ""){
        let counter = 0
        for (let x = 0; x < game_state.length; x++){
            for (let i = 0; i < game_state[x].length; i++){
                if (game_state[x][i] == "X" || game_state[x][i] == "0"){
                    counter += 1
                }
            }
        }
        if (counter >= 9){
            result = "draw"
            console.log(colors.rainbow("It was a draw!"))
        }
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
