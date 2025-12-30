import { Roles } from "../gamelogic/assignRoles";

describe('Roles methods', () => {

    const examplePlayerArray = [
        {
            username: 'Player1',
            player_id: 'exampleSocket',
            role: 0,
        },
        {
            username: 'Player2',
            player_id: 'exampleSocket',
            role: 0,
        },
        {
            username: 'Player3',
            player_id: 'exampleSocket',
            role: 0,
        },
        {
            username: 'Player4',
            player_id: 'exampleSocket',
            role: 0,
        },
    ]

    test('returns an array with only 1 wolf assigned, and the rest villagers', async () => {
        const result = await Roles.assignRoles({ playerInfo: examplePlayerArray, wolves: 1 })
        const mapped = result.map(player => player.role)
        expect(mapped).toContain(2)
        const villagers = mapped.filter(num => num === 0)
        expect(villagers).toHaveLength(3)
    })

    test('returns an array with 1 wolf, and 1 seer', async () => {
        const result = await Roles.assignRoles({ playerInfo: examplePlayerArray, wolves: 1, isSeer: true })
        const mapped = result.map(player => player.role)
        expect(mapped).toContain(2)
        expect(mapped).toContain(4)
        const villagers = mapped.filter(num => num === 0)
        expect(villagers).toHaveLength(2)

    })

    test('returns an array with 1 wolf, 1 seer, and 1 healer', async () => {
        const result = await Roles.assignRoles({ playerInfo: examplePlayerArray, wolves: 1, isSeer: true, isHealer: true })
        const mapped = result.map(player => player.role)
        expect(mapped).toContain(2)
        expect(mapped).toContain(4)
        expect(mapped).toContain(6)
        const villagers = mapped.filter(num => num === 0)
        expect(villagers).toHaveLength(1)

    })


}) 