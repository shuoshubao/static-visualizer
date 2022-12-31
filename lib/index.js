import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, Result, Card, Breadcrumb, Typography, Space, List, Button, Tooltip, theme } from 'antd'
import { HomeOutlined, FileOutlined, FolderOpenOutlined } from '@ant-design/icons'
import filesize from 'filesize'
import { isDark, addListenerPrefersColorScheme } from './util'

const { Text, Link } = Typography

const { defaultAlgorithm, darkAlgorithm } = theme

const getFileSize = size => {
  return filesize(size || 0, { base: 2, standard: 'jedec' })
}

const { code, root = '', url = '', files = [] } = window.data

const { origin: originUrl } = window.location

const App = () => {
  const isRoot = url.split('/').filter(Boolean).length === 0

  const rootButtonProps = { type: isRoot ? 'default' : 'link', icon: <HomeOutlined /> }

  if (!isRoot) {
    rootButtonProps.href = originUrl
  }

  return (
    <Card
      title={
        <Space>
          <Tooltip title={root} placement="bottomLeft">
            <Button {...rootButtonProps} />
          </Tooltip>
          <Breadcrumb>
            {url
              .split('/')
              .filter(Boolean)
              .map((v, i, arr) => {
                let item
                if (i === arr.length - 1) {
                  item = <Text>{v}</Text>
                } else {
                  item = <Link href={[originUrl, ...arr.slice(0, i + 1)].join('/')}>{v}</Link>
                }
                return <Breadcrumb.Item key={[i, v].join('_')}>{item}</Breadcrumb.Item>
              })}
          </Breadcrumb>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<FolderOpenOutlined />}>x{files.filter(({ isFile }) => !isFile).length}</Button>
          <Button icon={<FileOutlined />}>x{files.filter(({ isFile }) => isFile).length}</Button>
        </Space>
      }
      bordered={false}
      style={{ borderRadius: 0 }}
      bodyStyle={{ padding: 0, maxHeight: 'calc(100vh - 38px)', overflowY: 'auto' }}
    >
      <List
        dataSource={files}
        renderItem={(item, index) => {
          const { name, isFile, size } = item
          return (
            <>
              {index === 0 && !isRoot && (
                <List.Item style={{ padding: '4px 8px' }}>
                  <Space>
                    <FolderOpenOutlined />
                    <Link href={[originUrl, ...url.split('/').filter(Boolean).slice(0, -1)].join('/')}>..</Link>
                  </Space>
                </List.Item>
              )}
              <List.Item style={{ padding: '4px 8px' }}>
                <Space>
                  {isFile ? <FileOutlined /> : <FolderOpenOutlined />}
                  <Link href={[url, name].join('/').replace('//', '/')}>{name}</Link>
                </Space>
                <span>{getFileSize(size)}</span>
              </List.Item>
            </>
          )
        }}
      />
    </Card>
  )
}

const Root = () => {
  const [dark, setDark] = useState(isDark())

  useEffect(() => {
    addListenerPrefersColorScheme(value => {
      setDark(value)
    })
  }, [setDark])

  return (
    <ConfigProvider
      componentSize="small"
      theme={{
        algorithm: dark ? darkAlgorithm : defaultAlgorithm
      }}
    >
      <div
        style={{
          height: '100vh',
          overflowY: 'auto'
        }}
      >
        {code === 404 ? (
          <Result
            status="404"
            title="404"
            subTitle="Sorry, the file or directory you visited does not exist."
            extra={
              <Button type="primary" href={originUrl}>
                Go Root
              </Button>
            }
          />
        ) : (
          <App />
        )}
      </div>
    </ConfigProvider>
  )
}

createRoot(document.querySelector('#app')).render(<Root />)
