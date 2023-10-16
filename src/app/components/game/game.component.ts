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
  YourId: number;

  ConvertFam(cls: string): {Family: Number; Number: Number;} {
    let fam:Number = 0;
    switch(cls[0]){
      case "s":
        fam = 0;
        break;
      case "c":
        fam = 1;
        break;
      case "d":
        fam = 2;
        break;
      case "b":
        fam = 3;
        break;
    }
    return {
      Family: fam,
      Number: Number(cls.slice(1))
    }
  }

  constructor(private route: ActivatedRoute) {
    this.YourId = -1;
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
      case "YourId":
        this.YourId = Number(msg.Id);
      break;
      case "playerList":
        this.Mazzi = [];
        let j = 0;
        msg.Players.forEach((element: { PlayerId: string; PlayerName: string; }) => {
            //document.getElementById("player" + element.PlayerId)!.innerHTML = element.PlayerName;
            if(Number(element.PlayerId) === this.YourId){
              this.Mazzi[Number(element.PlayerId)] = new mazzo(element.PlayerId, 1);
              return;
            } else {
              this.Mazzi[Number(element.PlayerId)] = new mazzo(element.PlayerId, j);
            }
            j++;
            if(j === 1) j++;
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
        document.getElementById("mazzo")!.classList.add("tbc");
        document.getElementById("mazzo")!.onclick = () => { this.socket.send(JSON.stringify({
          Status: "picked"
        }));
        document.getElementById("mazzo")!.classList.remove("tbc");
       }
        break;
      case "playerPick":
        //document.getElementById("")
        break;
      case "Cards":
        for (let i = 0, j = 0; i < msg.Cards.length;)
        {
          let a = document.getElementById("card_"+this.YourId+j);
          if (a?.className !== "cempty") {
            j++;
            continue;
          }

          fam = "";
          switch(msg.Cards[i].Family) {
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

          a.className = fam + msg.Cards[i].Number;
          i++;
        }
        /*
        msg.Cards.forEach((element: {Family: Number; Number: Number;}, index: Number) => {
          fam = "";
          switch(element.Family) {
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
          document.getElementById("card_"+this.YourId+index)!.className = fam + element.Number; 
        });*/
        break;
      case "drop":
        for (let i = 0; i < 3; i++){
          let a = document.getElementById("card_"+this.YourId+i);
          a!.onclick = () => { 
            let sendfam = this.ConvertFam(a!.className);
            this.socket.send(JSON.stringify({
              Status: "drop",
              Card: sendfam
            }
            ))
            a!.className = "cempty";
          };
        }
      break;
      default:
        return;
      }

    });
  }
}
