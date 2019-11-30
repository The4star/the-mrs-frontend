import React from 'react';

import './message.styles.scss'

const Message = ({speaker, text}) => (
    <div className="wrapper">
        {
            speaker === 'the MRS' &&
            <div className="message-container bot">
                <div className="speaker">
                   <h3>{speaker}</h3> 
                </div>
                <div className="message-content">
                    <p>{text}</p>
                </div>
            </div>
        }
        {
            speaker === 'me' &&
            <div className="message-container user">
                <div className="speaker">
                   <h3>{speaker}</h3> 
                </div>
                <div className="message-content">
                    <p>{text}</p>
                </div>
            </div>
        }
    </div>
)

export default Message;