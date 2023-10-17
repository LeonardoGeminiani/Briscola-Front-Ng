import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { mazzo } from '../../models/mazzo';
import { Howl } from 'howler';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {

  sound = new Howl({
    src: ['./assets/menu.mp3'],
    html5 :true,
    loop: true,
  });

  play() {
    this.sound.play();
  }

  private id: number = 0;
  private socket:WebSocket;

  @ViewChild('mySwal')
  public readonly mySwal!: SwalComponent;
  
  Mazzi: mazzo[] = [];
  YourId: number;

  async delay(ms: number):Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

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
      Number: (Number(cls.slice(1)) ?? 0)
    }
  }

  constructor(private route: ActivatedRoute) {
    this.play();
    this.YourId = -1;
    let Name: string;
    this.route.queryParamMap.subscribe(params => {
      this.id = Number(params.get('id')) ?? undefined;
      Name = params.get('Name') ?? "";
    });

    console.log(this.id);
    this.socket = new WebSocket ( "wss://api.ittsrewritten.com/ws/" + this.id );
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
        document.getElementById("messagewait")!.hidden = true;
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
        let elementmazzo = document.getElementById("mazzo");
        elementmazzo!.classList.add("tbc");
        elementmazzo!.onclick = () => { this.socket.send(JSON.stringify({
          Status: "picked"
        }));
        elementmazzo!.classList.remove("tbc");
        elementmazzo!.onclick = null;
       }
        break;
      // queste sono dell'altro player
      case "pickedTableCards":
        let b = document.getElementsByClassName("cpick");
        Array.from(b).forEach( async (element) => {
        element.className = "cempty";
       });
       break;
      // queste sono x me
      case "pickTableCards":
       let a = document.getElementsByClassName("cpick");
       Array.from(a).forEach( async (element) => {
        element.className = "cempty";
      });
      break;
      case "playerPick":
        /*for (let i = 0; i < msg.NCards;i++){
          document.getElementById("card_" + msg.PlayerId + i)!.className = "bc";
        }*/
        for (let j = 0; j < 3 && msg.NCards > 0; j++){
          let a = document.getElementById("card_" + msg.PlayerId + j);
          if (a!.className === "cempty")
          {
            msg.NCards--;
            a!.className = "bc";
          }
        }
        break;
      case "playerDrop":
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
        document.getElementById("card_" + msg.PlayerId + Math.floor(Math.random() * 3))!.className = fam + msg.Card.Number + " cpick";
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
      case "YouWin":
      this.mySwal.title = "Hai vinto!";
      this.mySwal.fire().then( ()=> {
        document.location.href="/";
      });
      break;
      case "WinnerIs":
      this.mySwal.title = "Vince " + msg.Name + "!";
      this.mySwal.fire().then( ()=> {
        document.location.href="/";
      });
      break;
      case "drop":
        let clicked = false;
        for (let i = 0; i < 3; i++){
          let a = document.getElementById("card_"+this.YourId+i);
          a!.onclick = () => { 
            if (clicked == true) {
              return;
            }
            clicked = true
            let sendfam = this.ConvertFam(a!.classList[0]);
            this.socket.send(JSON.stringify({
              Status: "drop",
              Card: sendfam
            }
            ))
            a!.className += " cpick";
            a!.onclick = null;
          };
        }
      break;
      default:
        return;
      }

    });
  }
}
