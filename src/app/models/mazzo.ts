export class mazzo {
    // [class, id]
    //ids: string[];
    public cards: {cls: string, c:() => void}[] = [{
            cls: "cempty",
            c: () => {}
        }, {
            cls: "cempty",
            c: () => {}
        }, {
            cls: "cempty",
            c: () => {}
        }];
    indx: number;
    playerId: string;

    constructor(playerId: string, indx: number) {
        this.playerId = playerId;
        this.indx = indx;
        //
    }

    public getPlayerId(): string {
        return "player" + this.playerId;
    }
}