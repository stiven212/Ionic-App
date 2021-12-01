import { async } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { map } from 'rxjs/internal/operators/map';


export interface User {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  registeredClasses?: RegisteredClasses[];
}

export interface RegisteredClasses {
  classId: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  currentUser: User = {
    uid: '',
    email: '',
    displayName: '',
    emailVerified: false,
    registeredClasses: []
  };

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore,
    private ngZone: NgZone,
    private router: Router) {

  }

  public async signup({ email, password, displayName }): Promise<any> {
    const credential = await this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );

    const uid = credential.user.uid;

    return this.SetUserData(uid, email, displayName, true);
  }

  public signIn({ email, password }) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  public signOut(): Promise<void> {
    return this.afAuth.signOut();
  }

  // Sign in with Gmail
  public async GoogleAuth() {
    return await this.AuthLogin(new firebase.auth.GoogleAuthProvider());
  }

  // Auth providers
  private async AuthLogin(provider) {
    return this.afAuth.signInWithPopup(provider)
      .then(async (result) => {
        await this.SetUserData(result.user.uid, result.user.email, result.user.displayName,
          result.user.emailVerified);

        this.router.navigateByUrl('/menu/myclasses', { replaceUrl: true });
      })
  }

  // Store user in fireStore users collection.
  // If the user already exists in the collection, get the list of registered classes.
  // otherwise insert a new object
  async SetUserData(userId: string, userEmail: string, displayName: string,
    emailVerified: boolean) {

    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${userId}`);
    let classes: RegisteredClasses[];
    await userRef.ref.get().then(async (doc) => {
      if (doc.exists) {
        var existingDoc = doc.data();
        //Get the registered classes for the user
        let classesCollection: AngularFirestoreCollection<RegisteredClasses> =
          this.afs.collection<RegisteredClasses>('users/' + userId + '/RegisteredClasses');

        classesCollection.snapshotChanges().pipe(
          map(actions => {
            return actions.map(classFS => {
              if (classFS != null) {
                const classesData = classFS.payload.doc.data();
                const classId = classFS.payload.doc.id;
                return { classId, ...classesData };
              }
            });
          })
        ).subscribe(
          async (res) => { classes = res; },
          async (res) => { }
        );
        //Create the current user boject and assign the registeredClasses to it.
        this.currentUser = {
          uid: existingDoc.uid,
          email: existingDoc.email,
          emailVerified: existingDoc.emailVerified,
          displayName: existingDoc.displayName,
          registeredClasses: classes
        };
      }
      else {
        //It is a new user, add it to the collection.
        let userData: User = {
          uid: userId,
          displayName: displayName,
          emailVerified: emailVerified,
          email: userEmail
        };
        return userRef.set(userData);
      }
    });
  }

}