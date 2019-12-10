import React from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import {v4 as uuid} from 'uuid';
// components
import Message from '../message/message.component'

// sass
import './chatbot.styles.scss'

// chatbot logo
import logo from '../../img/logo.jpg'

const cookies = new Cookies();

class Chatbot extends React.Component {
    messagesEnd;
    constructor(props) {
        super(props) 
        
        this.state = {
            messages: [],
            hidden: true
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
        const allMessages = [];
        const botMessages = res.data.fulfillmentMessages; 
        const payloads = res.data.webhookPayload;
        console.log(payloads);
        if (botMessages && botMessages[0] && botMessages[0].text && botMessages[0].text.text) {
                let message = {
                    speaker: 'the MRS',
                    msg:botMessages[0].text.text[0]
                }
                allMessages.push(message)
        }
        if (payloads && payloads.fields && payloads.fields.cards) {
            let message = {
                speaker: 'the MRS',
                cards: payloads.fields.cards.listValue.values
            }
            allMessages.push(message)
        }
        
        allMessages.map(message => {
            return this.setState({messages: [...this.state.messages, message]})
        })
        
    }

    eventQuery = async (event) => {
        try {
            const res = await axios.post('https://the-mrs.herokuapp.com/api/df_event_query', {event, userId: cookies.get('userId')})
            const allMessages = []
            const botMessages = res.data.fulfillmentMessages 
            const payloads = res.data.webhookPayload
            console.log(payloads)
            if (botMessages && botMessages[0] && botMessages[0].text && botMessages[0].text.text) {
                    let message = {
                        speaker: 'the MRS',
                        msg:botMessages[0].text.text[0]
                    }
                    allMessages.push(message)
            }
            if (payloads && payloads.fields && payloads.fields.cards) {
                let message = {
                    speaker: 'the MRS',
                    cards: payloads.fields.cards.listValue.values
                }
                allMessages.push(message)
            }
            
            allMessages.map(message => {
                return this.setState({messages: [...this.state.messages, message]})
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
                    return <Message key={i} speaker={message.speaker} cards={message.cards} cardStyle/> 
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
        if (submission.value !== '') {
           this.textQuery(submission.value)
            submission.value = '' 
        } else {
            return
        }
        
    }
    
    render() {
        if (this.state.hidden) {
            return (
                <div className="hidden-chatbot" onClick={() => this.toggleBot()} >
                    <div className="logo-only">
                        <img className="logo-hider" src={logo} alt="logo"/>
                        <div ref={(el) => this.messagesEnd = el}></div>
                    </div>
                </div>     
            )
            
        } else {
            return(
                <div className="chatbot">
                    <div className="main-title">
                        <div className="logowrapper">
                          <img src={logo} alt="logo"/>  
                        </div>
                        <div className="text">
                            <p className="close-button" onClick={() => this.toggleBot()}>
                                Close
                            </p>  
                        </div>
                        
                    </div>
                        
                        <div className="messages-container">
                        {
                            this.renderMessages(this.state.messages)
                        }
                        <div ref={(el) => this.messagesEnd = el}></div>
                    </div>
                
                    <form className="input-form" onSubmit={this.handleSubmit}>
                    <input type="text" placeholder="Type a message..." className="user-input" />  
                    <button type="submit" className="submit"><i className="material-icons">&#xe163;</i></button>
                    </form>
                    
                </div>    
            )
        }
        
    }

    
}

export default Chatbot;