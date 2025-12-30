import shuffleArray from '../gamelogic/lib/shuffleArray'
export const Roles = {

    assignRoles: async ({ playerInfo, wolves, isSeer, isHealer }) => {
        const numOfPlayers = playerInfo.length
        const numOfWolves = wolves.number

        // create array with needed roles, returns roles array
        // create roles array, fill with needed wolves. wolves have role #2
        const rolesArr = Array(numOfWolves).fill(2)
        // if seer needed, add seer to roles array, role #4
        isSeer && rolesArr.push(4)
        // if healer needed, add healer to roles array, role #6
        isHealer && rolesArr.push(6)
        // all needed roles are in rolesarray, fill in left over villager roles
        while (rolesArr.length < numOfPlayers) {
            rolesArr.push(0)
        }
        // assign roles while roles array has values

        // shuffle roles array
        const shuffled = shuffleArray(rolesArr)

        // loop through array of player objects
        for (const player of playerInfo) {
            // assign last role in roles array to player
            player.role = shuffled.at(-1)

            // remove last role in roles array
            shuffled.pop()
        }
        return playerInfo

    },



}