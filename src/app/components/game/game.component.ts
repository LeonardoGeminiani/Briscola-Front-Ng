import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { mazzo } from '../../models/mazzo';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {

  private id: number = 0;
  private socket:WebSocket;
  
  Mazzi: mazzo[] = [];

  constructor(private route: ActivatedRoute) {

    let Name: string;
    this.route.queryParamMap.subscribe(params => {
      this.id = Number(params.get('id')) ?? undefined;
      Name = params.get('Name') ?? "";
    });

    console.log(this.id);
    this.socket = new WebSocket ( "ws://localhost:5177/ws/" + this.id );
    this.socket.addEventListener("open", (event) => {
      this.socket.send(JSON.stringify({
          Name: Name
      }));
    });

    this.socket.addEventListener("message", (event) => 
    {

      console.log("Message from server ", event.data);
      var msg = JSON.parse(event.data);
      let fam;
      switch(msg.Status) {
      case "playerList":
        this.Mazzi = [];
        msg.Players.forEach((element: { PlayerId: string; PlayerName: string; }) => {
            document.getElementById("player" + element.PlayerId)!.innerHTML = element.PlayerName;
            this.Mazzi[Number(element.PlayerId)] = new mazzo(element.PlayerId);
        });
        break;
      case "briscola":
        fam = "";
        switch(msg.Card.Family) {
          //spade  0 - coppe 1  - denari 2  - bastoni 3 
          case 0:
            fam = "s";
            break;
          case 1:
            fam = "c";
            break;
          case 2:
            fam = "d";
            break;
          case 3:
            fam = "b";
            break;
        }
        document.getElementById("briscola")!.className = "briscola " + fam + msg.Card.Number;
        break;
      case "pick":
        document.getElementById("mazzo")!.onclick = () => { this.socket.send(JSON.stringify({
          Status: "picked"
        })) }
        break;
      case "playerPick":
        document.getElementById("")
        break;
      case "Cards":

        break;
      default:
        return;
      }

    });
  }
}
