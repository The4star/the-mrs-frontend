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
        super(props) 
        
        this.state = {
            messages: [],
            hidden: false
        }

        if (cookies.get('userId') === undefined) {
          cookies.set('userId', uuid(), {path: '/'})  
        }
    }
    resolveAfterXSeconds = (x) => {
        return new Promise((resolve, reject) => {
            setTimeout(() =>{ 
             resolve(x);   
            }, x * 1000)
        })
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
                msg: botMessage.text ? botMessage.text.text[0] : null,
                cards: botMessage.payload && botMessage.payload.fields.cards ? botMessage.payload.fields.cards.listValue.values : null,
                followUp: botMessage.payload && botMessage.payload.fields.quickReplies ? botMessage.payload.fields.text.stringValue : null,
                quickReplies: botMessage.payload && botMessage.payload.fields.quickReplies ? botMessage.payload.fields.quickReplies.listValue.values : null
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
                    msg: botMessage.text.text[0] ? botMessage.text.text[0] : null,
                    cards: botMessage.payload && botMessage.payload.fields.cards ? botMessage.payload.fields.cards.listValue.values : null,
                    followUp: botMessage.payload && botMessage.payload.fields.quickReplies ? botMessage.payload.fields.text.stringValue : null,
                    quickReplies: botMessage.payload && botMessage.payload.fields.quickReplies ? botMessage.payload.fields.quickReplies.listValue.values : null
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
                } else if (message.cards)  {
                    return <Message key={i} speaker={message.speaker} cards={message.cards} /> 
                } else {
                    return <Message key={i} speaker={message.speaker} text={message.followUp} quickReplies={message.quickReplies} handleQuickReply={this.handleQuickReply}/> 
                }
                
            })
        } else {
            return null
        }
    }

    handleQuickReply = (text, payload) => {
        this.textQuery(text);
    }

    toggleBot = () => {
        this.setState({hidden: !this.state.hidden})
    }

    handleSubmit = async(e) => {
        e.preventDefault()
        let submission = e.target.children[0]
        this.textQuery(submission.value)
        submission.value = ''
    }
    
    render() {
        if (this.state.hidden) {
            return (
                <div className="hidden-chatbot">
                    <div onClick={() => this.toggleBot()} className="main-title">
                        <h2>
                            Melbourne Restaurant Suggester
                        </h2>
                        <div ref={(el) => this.messagesEnd = el}></div>
                    </div>
                </div>
                    
            )
            
        } else {
            return(
                <div className="chatbot">
                    <div onClick={() => this.toggleBot()} className="main-title">
                        <h2>
                            Melbourne Restaurant Suggester
                        </h2>
                    </div>
                        
                        <div className="messages-container">
                        
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

    
}

export default Chatbot;