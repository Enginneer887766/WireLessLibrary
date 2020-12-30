import React from 'react';
import { StyleSheet, Text, View , TouchableOpacity, TextInput, Image, Alert} from 'react-native';
import * as Permissions from "expo-permissions";
import {BarCodeScanner} from "expo-barcode-scanner";
import firebase from 'firebase';
import db from '../config';


export default class BookTransactionScreen extends React.Component {

    constructor() {
        super();
        this.state = {

        hasCameraPermission: null,
        scanned:false,
        scannedData: "",
        buttonState: "Normal",
        scannedBookID: "",
        scannedStudentID: "",
        transactionMsg: ""

        }

    }

    initializeBookIssue = async()=> {
        //transaction
        db.collection("transactions").add({
            "StudentID":this.state.scannedStudentID,
            "BookID":this.state.scannedBookID,
            "Date":firebase.firestore.Timestamp.now().toDate(),
            "transactionType":"Issue"

        })
        //change book collection status
        db.collection("Books").doc(this.state.scannedBookID).update({
            BookAvailibility:true
        })
        //change no. of book issued for student
        db.collection("Student").doc(this.state.scannedStudentID).update({
            'NumberOfBooksIssued': firebase.firestore.FieldValue.increment()+1
            
        })
        Alert.alert("Book Issued");
        this.setState({
            scannedBookID: "",
            scannedStudentID: ""
        })
    }

    initializeBookReturn = async()=> {
        //transaction
        db.collection("transactions").add({
            "StudentID":this.state.scannedStudentID,
            "BookID":this.state.scannedBookID,
            "Date":firebase.firestore.Timestamp.now().toDate(),
            "transactionType":"Return"

        })
        //change book collection status
        db.collection("Books").doc(this.state.scannedBookID).update({
            BookAvailibility:true
        })
        //change no. of book issued for student
        db.collection("Student").doc(this.state.scannedStudentID).update({
            'NumberOfBooksIssued': firebase.firestore.FieldValue.increment()-1
            
        })
        Alert.alert("Book Returned");
        this.setState({
            scannedBookID: "",
            scannedStudentID: ""
        })
    }
    

    getCameraPermission = async(ID)=> {

        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermission: status === 'granted',
            scanned: false,
            buttonState: ID

        })
        
    }

    handleTransaction = async()=> {
        var TransactionMessage = null;
        //db.collection(collectionName).doc(docID).get().then
        db.collection(Books).doc(this.state.scannedBookID).get()
        .then((doc) => {
            var book = doc.data();
            //console.log(doc.data())
            if (book.BookAvailibility) {
                this.initializeBookIssue();
                TransactionMessage = "Book Issued"
            }

            else {
                this.initializeBookReturn();
                TransactionMessage = "Book Returned"
            }
            
        })
        this.setState({
            transactionMsg: TransactionMessage
        })


    }

    handleBarCodeScanner = async(type, data)=> {
        this.setState({

            scanned: true,
            scannedData: data,
            buttonState: "Normal"

        })

    }

    render() {

        
        const hasCameraPermission = this.state.hasCameraPermission;
const scanned = this.state.scanned;
const buttonState = this.state.buttonState;
        if (buttonState === "Clicked" && hasCameraPermission) {
            return(
                <BarCodeScanner onBarCodeScanned  = {scanned?undefined : this.handleBarCodeScanner} />
            )

        }

        else if (buttonState !== "Undefined") {

            return(
               
                <View style={styles.container}>
                     <View><Image source = {require("../assets/booklogo.jpg")} 
                     style = {{
                        width:200,
                        height:200
                       }  } />
                       <Text style = {{ textAlign: 'center', fontSize:30}}>Wily
                       </Text>

                       </View>

                       <View style = {styles.input}>
                           
                       


                       </View>
                     <TouchableOpacity onPress= {()=> this.getCameraPermission("bookID") }>

                    <TextInput style={styles.inputBox} placeholder = "bookID" value = {this.state.scannedBookID}>
                    </TextInput>

                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style = {styles.text}>Scan</Text>
                        </TouchableOpacity>

                    <TouchableOpacity onPress= {()=> this.getCameraPermission("studentID") }>

                    <TextInput style={styles.inputBox} placeholder = "studentID" value = {this.state.scannedStudentID}>
                    </TextInput>

                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Text style = {styles.text}>Scan</Text>
                        </TouchableOpacity>
                

                <TouchableOpacity style={styles.scanButton} onPress = {this.getCameraPermission}>
                <Text style={styles.text}>Scan QR Code</Text>
                </TouchableOpacity>
                
                
                <Text style={styles.permissionText }>
                { hasCameraPermission === true ? this.state.scannedData : "Request Camera Permission"}

                        
                    
                    </Text>

                    <TouchableOpacity style={styles.submitbutton} onPress={this.handleTransaction}>
                        <Text style={styles.submitbuttonText} >
                            Submit
                        </Text>
                    
                </TouchableOpacity>
                
                </View>

                
            )

        }
       
    }
}

const styles = StyleSheet.create({
    text: {
        fontSize:20,
        fontWeight:"bold",
        marginLeft:90,
        marginTop:-45
    
    },
    container:{
        flex:1,
        justifyContent:"center",
        alignItems:"center"

    },
    displayText:{
        fontSize:50,
        textDecorationLine:'underline',
        
    },
    scanButton: {
        backgroundColor: "green",
        padding:40,
        margin:10,
        marginRight:40
    },
    permissionText: {
        fontSize: 20,
        fontFamily: "nougat"

    },
    inputBox: {
    flexDirection:'row',
    margin:20,
    backgroundColor:"lightblue",
    borderRadius:50,
    width:200,
    height:30
    },
    input: {
        width:200,
        height:40
    },
    submitbutton:{
        backgroundColor:"green",
        borderRadius:25,
        width:100,
        textAlign:'center',
       
    },
    submitbuttonText:{
        fontSize:20,
        fontStyle:"italic"
    }

    

})


