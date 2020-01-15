let game_state = [["0", "x", "0"],
                  ["0", "0", "x"],
                  ["x", "x", "0"]]

let directions = [[-1, 0],
                  [-1, 1],
                  [0, 1],
                  [1, 1],
                  [1, 0],
                  [1, -1],
                  [0, -1],
                  [-1, -1]]

for (let idx = 0; idx < game_state.length; idx++){
    for (let i = 0; i < game_state.length; i++){
        console.log(idx, i)
        for (let d_idx = 0; d_idx < directions.length; d_idx++){
            let length = check_directions(game_state, directions[d_idx], [idx, i], game_state[idx][i])
            if (length == 3){
                let winner = game_state[idx][i]
                idx = game_state.length
                i = game_state.length
                d_idx = directions.length
                console.log(winner + " won the game!")
            }
        }
    }
}

function check_directions(game_state, direction, current_position, current_value){    
    let length = 1
    let new_index = [current_position[0] + direction[0], current_position[1] + direction[1]]
    // if (new_index[0] in game_state) {
        if ([new_index[0]][new_index[1]] in game_state){
            let new_value = game_state[new_index[0]][new_index[1]]
            if (new_value === current_value){
                length += check_directions(game_state, direction, new_index, new_value)
            }
        }
    // }
    return length
}


// for each value in a 2d Array, travel in all 8 directions if possible, 
//     if next value is equal to the original value, keep going
