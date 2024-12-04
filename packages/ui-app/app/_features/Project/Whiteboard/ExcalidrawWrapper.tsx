'use client'
import useFileUpload from '@/components/FileKits/useFileUpload'
import { useUrl } from '@/hooks/useUrl'
import { storageGetFiles, storageUpdateFile } from '@/services/storage'
import {
  Excalidraw,
  Footer,
  MainMenu,
  serializeAsJSON
} from '@excalidraw/excalidraw'
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
import { FileStorage } from '@prisma/client'
import { randomId } from '@shared/ui'
import _ from 'lodash'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { IoIosSave } from 'react-icons/io'
import { IoCloudDownloadOutline } from 'react-icons/io5'
import { MdOutlineDraw } from 'react-icons/md'
import { useWhiteBoardContext } from './context'
import FilesOpenModal from './FilesOpenModal'
const prepareFile = async (file: File) => {
  const randId = randomId()
  return {
    randId: randId,
    data: file
  }
}

const ExcalidrawWrapper: React.FC = () => {
  const { uploadFileToS3 } = useFileUpload()
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null)
  const [showFilesModal, setShowFilesModal] = useState(false)
  const { files, setFiles, selectedFile, setSelectedFile } =
    useWhiteBoardContext()

  const [checkedElements, setCheckedElement] = useState<any[]>([])
  const [elements, setElements] = useState<any[]>([])

  const { getSp } = useUrl()
  const drawId = getSp('draw')
  const { push } = useRouter()
  const params = useParams()
  const mode = getSp('mode')

  const isChanged = useMemo(() => {
    return _.isEqual(checkedElements, elements)
  }, [checkedElements, elements])

  const createNewDraw = useCallback(() => {
    push(`${params.orgName}/project/${params.projectId}?mode=${mode}`)
    setSelectedFile(undefined)
    excalidrawAPI?.resetScene()
    setCheckedElement([])
    // excalidrawAPI?.updateScene({})
  }, [
    excalidrawAPI,
    mode,
    params.orgName,
    params.projectId,
    push,
    setSelectedFile
  ])

  const uploadFile = useCallback(
    async (file: File) => {
      const preparedFile = await prepareFile(file)
      return uploadFileToS3([preparedFile])
    },
    [uploadFileToS3]
  )

  const getDrawJson = useCallback(() => {
    if (excalidrawAPI) {
      const data = serializeAsJSON(
        excalidrawAPI.getSceneElements(),
        excalidrawAPI.getAppState(),
        excalidrawAPI.getFiles(),
        'local'
      )
      return data
    }
    return ''
  }, [excalidrawAPI])

  const onSave = useCallback(
    async (filename?: string) => {
      if (!excalidrawAPI) {
        return false
      }
      const jsonData = getDrawJson()
      console.log({ jsonData })
      const blob = new Blob([jsonData], { type: 'application/json' })

      // Create a File from the Blob
      const file = new File([blob], `${filename || Date.now()}.excalidraw`, {
        type: 'application/json'
      })

      const fileItems = await uploadFile(file)
      if (!fileItems.length) {
        return
      }
      const fileItem = fileItems[0]
      console.log({ fileItem, files })
      setFiles([...files, fileItem] as FileStorage[])
    },
    [excalidrawAPI, files, getDrawJson, setFiles, uploadFile]
  )

  const saveDraw = useCallback(async () => {
    if (selectedFile && excalidrawAPI) {
      const jsonData = getDrawJson()
      const file = new File(
        [new Blob([jsonData], { type: 'application/json' })],
        selectedFile.name,
        {
          type: selectedFile.type
        }
      )
      await storageUpdateFile(selectedFile, file)
    } else {
      onSave()
    }
    console.log('saved')
  }, [excalidrawAPI, getDrawJson, onSave, selectedFile])

  const openDraw = useCallback(
    (file?: FileStorage) => {
      if (file)
        push(
          `${params.orgName}/project/${params.projectId}?mode=${mode}&draw=${file.id}`
        )
      else {
        push(`${params.orgName}/project/${params.projectId}?mode=${mode}`)
        // createNewDraw()
      }
    },
    [mode, params.orgName, params.projectId, push]
  )

  useEffect(() => {
    setShowFilesModal(false)
  }, [selectedFile])

  useEffect(() => {
    console.log({ drawId })
    if (!drawId) return
    storageGetFiles([drawId])
      .then(res => {
        const files = res.data.data as FileStorage[]
        if (files?.length) {
          setSelectedFile(files[0])
        }
        //   setLoading(false)
        // }, 400)
      })
      .catch(err => {
        console.log({ err })
      })
  }, [drawId, setSelectedFile])

  useEffect(() => {
    ;(async () => {
      try {
        const url = selectedFile?.url
        console.log({ url })
        if (!url) return
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        excalidrawAPI?.updateScene(data)
      } catch (error) {
        console.log({ error })
      }
    })()
  }, [selectedFile, excalidrawAPI])

  // <MainMenu.DefaultItems.LiveCollaborationTrigger
  //   isCollaborating={isCollaborating}
  //   onSelect={() => window.alert("You clicked on collab button")}
  // />

  const renderMenu = () => {
    return (
      <MainMenu>
        <MainMenu.DefaultItems.SaveAsImage />
        <MainMenu.DefaultItems.Export />
        {/* <MainMenu.Separator />
        <MainMenu.Group title="Excalidraw links">
          <MainMenu.DefaultItems.Socials />
        </MainMenu.Group> */}
        <MainMenu.Separator />
        <MainMenu.ItemCustom>
          <span
            className="flex items-center gap-3 cursor-pointer"
            onClick={setShowFilesModal.bind(null, true)}>
            <IoCloudDownloadOutline />
            <p>Open from storage</p>
          </span>
        </MainMenu.ItemCustom>
        {/* <MainMenu.ItemCustom>
          <span
            className="flex items-center gap-3 cursor-pointer"
            onClick={onSave.bind(null, 'json')}>
            <IoCloudUploadOutline />
            <p>Save to storage</p>
          </span>
        </MainMenu.ItemCustom> */}
        <MainMenu.ItemCustom>
          <span
            className="flex items-center gap-3 cursor-pointer"
            onClick={createNewDraw}>
            <MdOutlineDraw />
            <p>New draw</p>
          </span>
        </MainMenu.ItemCustom>

        {/* <MainMenu.DefaultItems.Help /> */}
      </MainMenu>
    )
  }

  return (
    <div className="w-full h-full">
      <Excalidraw
        excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
        onChange={elements => {
          setElements(elements as [])
        }}>
        {renderMenu()}
        <Footer>
          <button
            className="ml-2 w-9 h-9 flex justify-center items-center rounded-md border "
            onClick={() => {
              saveDraw()
              console.log(`save file, num element: ${elements.length}`)
            }}
            type="button"
            style={{ backgroundColor: !isChanged ? '#e0dfff' : '#f1f3f5' }}>
            <IoIosSave />
          </button>
        </Footer>
      </Excalidraw>
      <FilesOpenModal
        visible={showFilesModal}
        setVisible={() => setShowFilesModal(false)}
        onSubmit={openDraw}
      />
    </div>
  )
}
export default ExcalidrawWrapper
