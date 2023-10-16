import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.css']
})
export class CreateGameComponent {

  /**
   *
   */
  constructor(private router: Router) {}


  setup() 
  {
    document.getElementById("menusettings")!.hidden = false;
    document.getElementById("mainmenu")!.hidden = true;
  }

  connect()
  {
    console.log('Connecting');
    fetch("https://api.ittsrewritten.com/CreateGame", {
    method: "POST",
    body: JSON.stringify({
        briscolaMode: 2,
        userNumber: 1,
        difficulty: 1
    }),
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
    })
    .then((response) => response.json())
    .then((id) => this.router.navigate(['game'], {
      queryParams: {
        id : id,
        Name : "pippo"
      }
    }));
  }



}
