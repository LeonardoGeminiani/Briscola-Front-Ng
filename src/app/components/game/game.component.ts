import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { mazzo } from '../../models/mazzo';
import { Howl } from 'howler';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnDestroy {

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
  public Points: number = 0;

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

  GetFam(Family: Number){
    let fam = "";
    switch(Family) {
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

    return fam;
  }

  ngOnDestroy(): void {
    // deleate sockets
    document.location.href="/";
  }

  init(msg: any): void {
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
      var msg = JSON.parse(event.data);
      console.log(msg);
      let fam;
      switch(msg.Status) {
      case "YourId":
        this.YourId = Number(msg.Id);
      break;
      case "playerList":
        this.init(msg);
        break;
      case "briscola":
        //document.getElementsByClassName('rot-1')[0].appendChild(document.getElementById('Points')!);
        fam = this.GetFam(msg.Card.Family);
        // switch(msg.Card.Family) {
        //   //spade  0 - coppe 1  - denari 2  - bastoni 3 
        //   case 0:
        //     fam = "s";
        //     break;
        //   case 1:
        //     fam = "c";
        //     break;
        //   case 2:
        //     fam = "d";
        //     break;
        //   case 3:
        //     fam = "b";
        //     break;
        // }
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
        this.Mazzi.forEach(el => el.cards.forEach(c => {
          if(c.cls.includes("cpick")){
            c.cls = "cempty";
          }
        }));
      //   let b = document.getElementsByClassName("cpick");
      //   Array.from(b).forEach( async (element) => {
      //   element.className = "cempty";
      //  });
       break;
      // queste sono x me
      case "pickTableCards":
      //  let a = document.getElementsByClassName("cpick");
      //  Array.from(a).forEach( async (element) => {
      //   element.className = "cempty";
      // });
      this.Mazzi.forEach(el => el.cards.forEach(c => {
        if(c.cls.includes("cpick")){
          c.cls = "cempty";
        }
      }));
      break;
      case "playerPick":
        /*for (let i = 0; i < msg.NCards;i++){
          document.getElementById("card_" + msg.PlayerId + i)!.className = "bc";
        }*/
        for (let j = 0; j < 3 && msg.NCards > 0; j++){
          // let a = document.getElementById("card_" + msg.PlayerId + j);
          if (
            this.Mazzi[Number(msg.PlayerId)].cards[j].cls === "cempty")
          {
            msg.NCards--;
            this.Mazzi[Number(msg.PlayerId)].cards[j].cls = "bc";
          }
        }
        break;
      case "playerDrop":
        fam = this.GetFam(msg.Card.Family);
        // switch(msg.Card.Family) {
        //   //spade  0 - coppe 1  - denari 2  - bastoni 3 
        //   case 0:
        //     fam = "s";
        //     break;
        //   case 1:
        //     fam = "c";
        //     break;
        //   case 2:
        //     fam = "d";
        //     break;
        //   case 3:
        //     fam = "b";
        //     break;
        // }
        
        let arr = [];
        for(let i = 0; i < 3; ++i){
          
          // let tmp = document.getElementById("card_" + msg.PlayerId + i);
          // if(tmp!.classList.contains("cempty")) continue;
          // arr.push(tmp);
          if(this.Mazzi[Number(msg.PlayerId)].cards[i].cls.includes("cempty")) continue;
          arr.push(i);
        }
        this.Mazzi[Number(msg.PlayerId)].cards[arr[Math.floor(Math.random() * arr.length)]].cls = fam + msg.Card.Number + " cpick";
        break;
      case "BriscolaInMazzo":
        document.getElementById("briscola")!.className = "briscola cempty";
        break;
      case "Cards":
        for (let i = 0, j = 0; i < msg.Cards.length;)
        {
          console.log(this.Mazzi[this.YourId].cards[j].cls);
          // let a = document.getElementById("card_"+this.YourId+j);
          if (this.Mazzi[this.YourId].cards[j].cls !== "cempty") {
            j++;
            continue;
          }

          fam = this.GetFam(msg.Cards[i].Family);
          // switch(msg.Cards[i].Family) {
          //   //spade  0 - coppe 1  - denari 2  - bastoni 3 
          //   case 0:
          //     fam = "s";
          //     break;
          //   case 1:
          //     fam = "c";
          //     break;
          //   case 2:
          //     fam = "d";
          //     break;
          //   case 3:
          //     fam = "b";
          //     break;
          // }

          this.Mazzi[this.YourId].cards[j].cls = fam + msg.Cards[i].Number;
          i++;
        }
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
      case "Points":
        this.Points = Number(msg.Value);
        // this.SetPoints(msg.Value);
      break;
      case "drop":
        let clicked = false;
        for (let i = 0; i < 3; i++){
          // let a = document.getElementById("card_"+this.YourId+i);
          this.Mazzi[this.YourId].cards[i].c = () => {
            if (clicked == true) {
              return;
            }
            clicked = true
            let sendfam = this.ConvertFam(this.Mazzi[this.YourId].cards[i].cls.split(" ")[0].trim());
            this.socket.send(JSON.stringify({
              Status: "drop",
              Card: sendfam
            }
            ))
            this.Mazzi[this.YourId].cards[i].cls += " cpick";
            this.Mazzi[this.YourId].cards[i].c = () => {};
            console.log(i);
          };
        }
      break;        
      case "info":
        // reconnected
        this.init(msg);
        
        for (let i = 0; i < msg.Players.length; i++){
          let n = Number(msg.Players[i].CardsNumber);
          for(let j = 0; j < n; j++){
            // console.log("card_" + msg.Players[i].PlayerId + j);
            this.Mazzi[Number(msg.Players[i].PlayerId)].cards[j].cls = "bc";
            // let a = document.getElementById("card_" + msg.Players[i].PlayerId + j);
            // a!.className = "bc";
          }
        }

        this.Points = Number(msg.PlayerPoints);

        document.getElementById("briscola")!.className = "briscola " + this.GetFam(msg.Briscola.Family) + msg.Briscola.Number;
        // this.SetPoints(msg.PlayerPoints);
      break;
      default:
        return;
      }

    });
  }
}
