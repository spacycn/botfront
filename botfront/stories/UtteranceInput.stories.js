import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import {
    withKnobs, text, select, boolean,
} from '@storybook/addon-knobs';
import UtteranceInput from '../imports/ui/components/utils/UtteranceInput';

function UtteranceInputWrapped(props) {
    const [utterance, setUtterance] = useState('test');
    return (
        <UtteranceInput {...props} value={utterance} onChange={setUtterance} />
    );
}

storiesOf('UtteranceInput', module)
    .addDecorator(withKnobs)
    .add('default', () => (
        <UtteranceInputWrapped />
    ))
    .add('with value', () => <UtteranceInputWrapped value='a test value' />)
    .add('with props', () => (
        <UtteranceInputWrapped
            placeholder={text('placeholder', 'User says')}
            size={select(
                'size',
                ['mini', 'small', 'medium', 'large', 'big', 'huge', 'massive'],
                'mini',
            )}
            fluid={boolean('fluid', false)}
        />
    ));
