export class mazzo {
    // [class, id]
    ids: string[];
    playerId: string;

    constructor(playerId: string) {
        this.playerId = playerId;
        this.ids = [];
        for (let i = 0; i < 3; i++) {
            this.ids[i] = `card_${playerId}${i}`;
        }
    }

    public getPlayerId(): string {
        return "player" + this.playerId;
    }
}