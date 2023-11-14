import React, {useState, useEffect} from 'react'

import {VyperCompilationOutput, remixClient, toStandardOutput} from './utils'
import {CompilationResult} from '@remixproject/plugin-api'

// Components
import CompilerButton from './components/CompilerButton'
import WarnRemote from './components/WarnRemote'
import VyperResult from './components/VyperResult'
import LocalUrlInput from './components/LocalUrl'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import Button from 'react-bootstrap/Button'

import './app.css'
import { VyperCompilationResultType } from './utils/types'

interface AppState {
  status: 'idle' | 'inProgress'
  environment: 'remote' | 'local'
  compilationResult?: CompilationResult
  localUrl: string
}

interface OutputMap {
  [fileName: string]: VyperCompilationOutput
}

const App: React.FC = () => {
  const [contract, setContract] = useState<string>()
  const [output, setOutput] = useState<any>({})
  const [state, setState] = useState<AppState>({
    status: 'idle',
    environment: 'local',
    localUrl: 'http://localhost:8000'
  })
  const [compilerResponse, setCompilerResponse] = useState<any>({})

  useEffect(() => {
    async function start() {
      try {
        await remixClient.loaded()
        remixClient.onFileChange((name) => setContract(name))
        remixClient.onNoFileSelected(() => setContract(''))
      } catch (err) {
        console.log(err)
      }
      try {
        const name = await remixClient.getContractName() // throw if no file are selected
        setContract(name)
      } catch (e) {}
    }
    start()
  }, [])

  // useEffect(() => {
  //   const getStandardOutput = () => {
  //     const contractName = contract.split('/').slice(-1)[0].split('.')[0]
  //     const compiledAbi = output['contractTypes'][contractName].abi
  //     const deployedBytecode = output['contractTypes'][contractName].deploymentBytecode.bytecode.replace('0x', '')
  //     const bytecode = output['contractTypes'][contractName].runtimeBytecode.bytecode.replace('0x', '')
  //     const compiledAst = output['contractTypes'][contractName].abi
  //     //const methodIdentifiers = JSON.parse(JSON.stringify(compilationResult['method_identifiers']).replace(/0x/g, ''))
  //     return {
  //       sources: {
  //         [contract]: {
  //           id: 1,
  //           ast: compiledAst,
  //           legacyAST: {} as any
  //         }
  //       },
  //       contracts: {
  //         [contract]: {
  //           // If the language used has no contract names, this field should equal to an empty string
  //           [contractName]: {
  //             // The Ethereum Contract ABI. If empty, it is represented as an empty array.
  //             // See https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
  //             abi: compiledAbi,
  //             evm: {
  //               bytecode: {
  //                 linkReferences: {},
  //                 object: deployedBytecode,
  //                 opcodes: ''
  //               },
  //               deployedBytecode: {
  //                 linkReferences: {},
  //                 object: bytecode,
  //                 opcodes: ''
  //               },
  //               // methodIdentifiers: methodIdentifiers
  //             }
  //           }
  //         } as any
  //       }
  //     }
  //   }
  //   const data = getStandardOutput()
  //   console.log({ data })
  //   setCompilerResponse(data)
  // }, [output])

  /** Update the environment state value */
  function setEnvironment(environment: 'local' | 'remote') {
    setState({...state, environment})
  }

  function setLocalUrl(url: string) {
    setState({...state, localUrl: url})
  }

  function compilerUrl() {
    return state.environment === 'remote' ? 'https://vyper2.remixproject.org/' : state.localUrl
  }

  return (
    <main id="vyper-plugin">
      <header>
        <div className="title">
          <img src={'assets/logo.svg'} alt="Vyper logo" />
          <h4>yper Compiler</h4>
        </div>
        <a rel="noopener noreferrer" href="https://github.com/ethereum/remix-project/tree/master/apps/vyper" target="_blank">
          <i className="fab fa-github"></i>
        </a>
      </header>
      <section>
        <div className="px-4 w-100">
          <Button data-id="add-repository" className="w-100 text-dark w-100 bg-light btn-outline-primary " onClick={() => remixClient.cloneVyperRepo()}>
            Clone Vyper examples repository
          </Button>
        </div>
        <ToggleButtonGroup name="remote" onChange={setEnvironment} type="radio" value={state.environment}>
          <ToggleButton data-id="remote-compiler" variant="secondary" name="remote" value="remote">
            Remote Compiler v0.3.10
          </ToggleButton>
          <ToggleButton data-id="local-compiler" variant="secondary" name="local" value="local">
            Local Compiler
          </ToggleButton>
        </ToggleButtonGroup>
        <LocalUrlInput url={state.localUrl} setUrl={setLocalUrl} environment={state.environment} />
        <WarnRemote environment={state.environment} />
        <div className="px-4" id="compile-btn">
          <CompilerButton
            compilerUrl={compilerUrl()}
            contract={contract}
            setOutput={(name, update) => setOutput({...output, [name]: update})}
          />
        </div>
        <article id="result" className="px-2">
          {/* <VyperResult output={contract ? output[contract] : undefined} contractName={contract} /> */}
          <VyperResult output={contract ? output : undefined} />
        </article>
      </section>
    </main>
  )
}

export default App
