import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import {
    withKnobs, select,
} from '@storybook/addon-knobs';
import { load as yamlLoad } from 'js-yaml';
import { Message, Image } from 'semantic-ui-react';
import BotResponseContainer from '../imports/ui/components/stories/common/BotResponseContainer';

const responseOne = {
    key: 'utter_yay',
    values: [{
        lang: 'en',
        sequence: [
            { content: 'text: YAY!!' },
            { content: 'text: BOO!!' },
            { content: 'text: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
        ],
    }],
};

const responseTwo = {
    key: 'utter_boo',
    values: [{
        lang: 'en',
        sequence: [
            { content: 'text: I love peanutes too' },
            { content: 'text: Can I call you l8r' },
            { content: 'text: <3' },
        ],
    }],
};

const virginTextResponse = {
    key: 'utter_new_1',
    values: [{
        lang: 'en',
        sequence: [
            { content: 'text: \'\'' },
        ],
    }],
};

export const responses = [responseOne, responseTwo];

const BotResponseContainerWrapped = (props) => {
    const [status, setStatus] = useState(null);
    const { value: initValue, ...rest } = props;
    const [value, setValue] = useState(yamlLoad(initValue.values[0].sequence[0].content));

    if (!status) {
        return (
            <div className='story-visual-editor'>
                <BotResponseContainer
                    {...rest}
                    onDelete={() => setStatus('delete !')}
                    onAbort={() => setStatus('abort!')}
                    value={value}
                />
            </div>
        );
    }
    return (
        <Message color='violet' style={{ width: '250px' }}>
            <Image src='https://cdn.clipart.email/1bdd4ce92ebd2dd1017d03765e853c16_unicorn-clipart-images-free-download2018_660-800.png' size='small' />
            {status}
        </Message>
    );
};

storiesOf('BotResponseContainer', module)
    .addDecorator(withKnobs)
    .add('w/o value', () => (
        <BotResponseContainerWrapped value={virginTextResponse} />
    ))
    .add('w/ value', () => (
        <BotResponseContainerWrapped
            value={select('response', responses, responseOne)}
        />
    ));
