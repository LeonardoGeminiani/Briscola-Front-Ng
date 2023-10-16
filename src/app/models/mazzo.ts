export class mazzo {
    // [class, id]
    ids: string[];
    indx: number;
    playerId: string;

    constructor(playerId: string, indx: number) {
        this.playerId = playerId;
        this.indx = indx;
        this.ids = [];
        for (let i = 0; i < 3; i++) {
            this.ids[i] = `card_${playerId}${i}`;
        }
    }

    public getPlayerId(): string {
        return "player" + this.playerId;
    }
}