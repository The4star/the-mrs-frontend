import React from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import {v4 as uuid} from 'uuid';
// components
import Message from '../message/message.component'

import './chatbot.styles.scss'

const cookies = new Cookies();

class Chatbot extends React.Component {
    messagesEnd;
    constructor(props) {
        super() 
        
        this.state = {
            messages: []
        }

        if (cookies.get('userId') === undefined) {
          cookies.set('userId', uuid(), {path: '/'})  
        }
    }

    componentDidMount = async () => {
        await this.eventQuery('Welcome')
    }

    componentDidUpdate = () => {
        this.messagesEnd.scrollIntoView({behaviour: 'smooth'})
    }

    textQuery = async (text) => {
        let message = {
            speaker: 'me',
            msg: text
        }

        this.setState({messages: [...this.state.messages, message]})

        const res = await axios.post('https://the-mrs.herokuapp.com/api/df_text_query', {text, userId: cookies.get('userId')})
        const botMessages = res.data.fulfillmentMessages 
        
        botMessages.map(botMessage => {
            let message = {
                speaker: 'the MRS',
                msg: botMessage.text ? botMessage.text.text[0] : null
            }
            
           return this.setState({messages:[...this.state.messages, message]})
        })
    }

    eventQuery = async (event) => {
        try {
            const res = await axios.post('https://the-mrs.herokuapp.com/api/df_event_query', {event, userId: cookies.get('userId')})
            const botMessages = res.data.fulfillmentMessages
            botMessages.map(botMessage => {
                let message = {
                    speaker: 'the MRS',
                    msg: botMessage.text.text[0] ? botMessage.text.text[0] : null
                }
            return  this.setState({messages:[...this.state.messages, message]})
            })  
        } catch (error) {
            console.log(error)
        }

    }

    renderMessages = (stateMessages) => {
        if(stateMessages) {
            return stateMessages.map((message, i) => {
                if (message.msg) {
                   return <Message key={i} speaker={message.speaker} text={message.msg} /> 
                } else {
                    return <h1> Cards</h1>
                }
                
            })
        } else {
            return null
        }
    }

    handleSubmit = (e) => {
        e.preventDefault()
        let submission = e.target.children[0]

        this.textQuery(submission.value)
        submission.value = ''
    }
    
    render() {


        return(
            <div className="chatbot">
                <div className="messages-container">
                     <h2 className="title">
                    Melbourne Restaurant Suggester
                    </h2>
                    {
                        this.renderMessages(this.state.messages)
                    }
                    <div ref={(el) => this.messagesEnd = el}></div>
                </div>
               
                <form className="input-form" onSubmit={this.handleSubmit}>
                  <input type="text" placeholder="ask away!" className="user-input" />  
                  <button type="submit" className="submit">+</button>
                </form>
                
            </div>    
        )
    }

    
}

export default Chatbot;