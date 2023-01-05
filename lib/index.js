import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ConfigProvider,
  Layout,
  Result,
  Card,
  Breadcrumb,
  Typography,
  Space,
  Table,
  Button,
  Tooltip,
  theme
} from 'antd'
import dayjs from 'dayjs'
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

const isRoot = url.split('/').filter(Boolean).length === 0

const rootButtonProps = { type: isRoot ? 'default' : 'link', icon: <HomeOutlined /> }

if (!isRoot) {
  rootButtonProps.href = originUrl
}

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (name, record, index) => {
      const { isFile } = record
      if (!isRoot && index === 0) {
        return (
          <Space>
            <FolderOpenOutlined />
            <Button type="link" href={[originUrl, ...url.split('/').filter(Boolean).slice(0, -1)].join('/')}>
              ..
            </Button>
          </Space>
        )
      }
      return (
        <Space>
          {isFile ? <FileOutlined /> : <FolderOpenOutlined />}
          <Button type="link" href={[url, name].join('/').replace('//', '/')}>
            {name}
          </Button>
        </Space>
      )
    }
  },
  {
    title: 'MIME type',
    dataIndex: 'type',
    width: 180,
    render: type => {
      return <Button type="text">{type}</Button>
    }
  },
  {
    title: 'ctime',
    dataIndex: 'ctime',
    width: 175,
    render: ctime => {
      return <Button type="text">{dayjs(ctime).format('YYYY-MM-DD HH:mm:ss')}</Button>
    }
  },
  {
    title: 'mtime',
    dataIndex: 'mtime',
    width: 175,
    render: mtime => {
      return <Button type="text">{dayjs(mtime).format('YYYY-MM-DD HH:mm:ss')}</Button>
    }
  },
  {
    title: 'Size',
    dataIndex: 'size',
    width: 100,
    align: 'right',
    render: size => {
      return <Button type="text">{getFileSize(size)}</Button>
    }
  }
].map((v, i) => {
  const { render } = v
  v.render = (value, record, index) => {
    if (!isRoot && index === 0 && i !== 0) {
      return null
    }
    return render(value, record, index)
  }
  return v
})

const App = () => {
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
      <Table
        rowKey="name"
        dataSource={isRoot ? files : [{ name: '' }, ...files]}
        columns={columns}
        showHeader={true}
        pagination={false}
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
      <Layout
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
      </Layout>
    </ConfigProvider>
  )
}

createRoot(document.querySelector('#app')).render(<Root />)
