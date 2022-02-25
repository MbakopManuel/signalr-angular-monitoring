import { Injectable, EventEmitter } from "@angular/core";
import * as signalR from "@aspnet/signalr";
import { SignalViewModel } from "../models/signal-view-model";

@Injectable({
  providedIn: "root"
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  signalReceived = new EventEmitter<SignalViewModel>();

  constructor() {
    this.buildConnection();
    this.startConnection();
  }

  private buildConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:8002/notificationhub") //use your api adress here and make sure you use right hub name.
      .build();
  };

  private startConnection() {
    this.hubConnection
      .start()
      .then(() => {
        console.log("Connection Started...");
        console.log("join group");
        this.joinGroup("1973632608");
        this.registerSignalEvents();
      })
      .catch(err => {
        console.log("Error while starting connection: " + err);
        let that = this;
        //if you get error try to start connection again after 3 seconds.
        setTimeout(function() {
          that.startConnection();
        }, 3000);
      });
  };

  private joinGroup(referenceId: string){
    console.log("connection to : " + referenceId);
    try {
      this.hubConnection.invoke("JoinPaymentNotification", referenceId);
    } catch (error) {
      console.log(error);

    }

  }

  private registerSignalEvents() {
    this.hubConnection.on("ReceivePaymentNotification", (data: SignalViewModel) => {
      this.signalReceived.emit(data);
    });
  }
}
