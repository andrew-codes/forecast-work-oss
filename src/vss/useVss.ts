import * as React from 'react'
import context from './context'

const useVss = () => {
    const vss = React.useContext(context)

    return vss
}

export default useVss