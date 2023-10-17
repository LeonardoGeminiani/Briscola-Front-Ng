import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.css']
})
export class CreateGameComponent {

  sound = new Howl({
    src: ['./assets/flipcard.mp3'],
    html5 :true,
  });

  play() {
    this.sound.play();
  }

  /**
   *
   */
  constructor(private router: Router) {}

  private mp: boolean = false;

  @ViewChild('mySwal')
  public readonly mySwal!: SwalComponent;

  unisciti() 
  {
    document.getElementById("uniscitisettings")!.hidden = false;
    document.getElementById("unisciti")!.hidden = true;
    document.getElementById("mainmenu")!.hidden = true;
  }

  uniscitiid()
  {
    this.router.navigate(['game'], {
      queryParams: {
        id : Number((<HTMLInputElement>document.getElementById("idpartita")).value),
        Name : (<HTMLInputElement>document.getElementById("username")).value
      }});
  }

  setup() 
  {
    document.getElementById("menusettings")!.hidden = false;
    document.getElementById("mainmenu")!.hidden = true;
    document.getElementById("unisciti")!.hidden = true;
    this.play();
  }

  shownum()
  {
    this.mp = true;
  }

  hidenum()
  {
    this.mp = false;
  }

  connect()
  {
    let username = (<HTMLInputElement>document.getElementById("username")).value;
    let players;
    let nplayers;
    if (this.mp) {
      nplayers = (<HTMLInputElement>document.getElementById("nplayers")).value;
      players = nplayers;
    } else {
      players = 1;
      nplayers = (<HTMLInputElement>document.getElementById("nplayers")).value;
    }
    console.log("nplayers " + nplayers);
    console.log("players " + players);

    if (Number(nplayers) > 4 || Number(players) > 4 || Number(nplayers) < 2) {
      return;
    }
    
    this.play();
    console.log('Connecting');
    fetch("https://api.ittsrewritten.com/CreateGame", {
    method: "POST",
    body: JSON.stringify({
        briscolaMode: Number(nplayers),
        userNumber: Number(players),
        difficulty: 1
    }),
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
    })
    .then((response) => response.json())
    .then((id) => {
      this.mySwal.text = "Il codice è " + id;
      this.mySwal.fire().then( ()=> {
        this.router.navigate(['game'], {
          queryParams: {
            id : id,
            Name : username
          }
          });
      });
    })
    /*.then((id) => this.router.navigate(['game'], {
      queryParams: {
        id : id,
        Name : username
      }
    }));*/
  }



}
