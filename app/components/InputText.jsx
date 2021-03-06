import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
    input::-webkit-input-placeholder {
        color: ${props => props.placeholderColor} !important;
    }

    input:-moz-placeholder {
        color: ${props => props.placeholderColor} !important;  
    }
     
    input::-moz-placeholder { 
        color: ${props => props.placeholderColor} !important;  
    }
     
    input:-ms-input-placeholder {  
        color: ${props => props.placeholderColor} !important;  
    }
`;

const Input = styled.input`
    width: ${props => props.width};
    height: 40px;
    padding: 10px;
    fontSize: 16px;
    backgroundColor: white;
    border: 3px solid ${props => props.borderColor};
    borderRadius: 8px;
    color: ${props => props.color};
`;

const Feedback = styled.div`
    width: ${props => props.width};
    textAlign: left;
    color: ${props => props.color || 'black'};
`;

export default class InputText extends React.Component {
    constructor() {
        super();
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleKeyPress(e) {
        if (e.key == 'Enter') {
            ReactDOM.findDOMNode(this.refs.textField).blur();
            this.props.onSubmit();
        }
    }

    render() {
        return (
            <Wrapper placeholderColor={this.props.placeholderColor}>
                {this.props.feedback
                    ? <Feedback
                          color={this.props.feedbackColor}
                          width={this.props.width}
                      >
                          {this.props.feedback}
                      </Feedback>
                    : <br />}
                <Input
                    type="text"
                    ref="textField"
                    width={this.props.width}
                    color={this.props.color}
                    borderColor={this.props.borderColor}
                    placeholder={this.props.placeholder}
                    style={{
                        placeholderTextColor: this.props.placeholderColor
                    }}
                    value={this.props.value}
                    onChange={this.props.onChange}
                    onKeyDown={e => {
                        this.handleKeyPress(e);
                    }}
                />
            </Wrapper>
        );
    }
}
