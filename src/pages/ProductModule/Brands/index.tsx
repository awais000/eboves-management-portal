import { DownOutlined, PlusOutlined, RightOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Switch, Input, Tag } from 'antd';
import React, { useState, useRef } from 'react';
import { connect,history } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType, IntlProvider, enUSIntl } from '@ant-design/pro-table';
import { SorterResult } from 'antd/es/table/interface';
import { fetchBrands } from './service';
import { BrandItem } from './data';
import style from './index.less';
// import CreateOrUpdate from './Create';

const TableList: React.FC<any> = (props) => {
  const [sorter, setSorter] = useState<string>('');
  const actionRef = useRef<ActionType>();
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
 
  const {
    loading,
    dispatch,
    // brands,
  } = props;

  const toggleActiveStatus = (id: number) => {
    dispatch({ type: 'brands/toggleActiveStatus', payload: id });
  };

  const handleBulkDelete = (ids: any) => {
    dispatch({
      type: 'brands/bulkDelete',
      payload: ids,
      callback: () => {
        // eslint-disable-next-line no-unused-expressions
        actionRef.current?.reload();
        // eslint-disable-next-line no-unused-expressions
        actionRef.current?.clearSelected();
      },
    });
  };

  const onEditClickHandler = (record: BrandItem) => {
    // setEditDrawer({ isUpdate: true, data: record });
    // setOpenDrawer(true);
  };

  const columns: ProColumns<BrandItem>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      renderText: (text, record) => {
        return (
          <div>
            {text}
            <span>
              {record.new && (
                <Tag
                  style={{ fontSize: '9px', marginLeft: '3px', lightingColor: '16px' }}
                  color="green"
                >
                  new
                </Tag>
              )}
              {record.popularity && (
                <Tag
                  style={{ fontSize: '9px', marginLeft: '3px', lightingColor: '16px' }}
                  color="green"
                >
                  popular
                </Tag>
              )}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Active',
      dataIndex: 'active',
      sorter: true,
      width: '10%',
      valueEnum: {
        true: {
          text: 'Active',
        },
        false: {
          text: 'Inactive',
        },
      },
      onFilter: (value: any, record: BrandItem) => {
        const v = value.toLowerCase() === 'true';
        return record.active === v;
      },
      renderText: (text, record) => {
        const active = text === 'Active';
        if (record.default) return <Tag className="tag-primary-color">Default</Tag>;
        return <Switch defaultChecked={active} onChange={() => toggleActiveStatus(record.id)} />;
      },
    },
    {
      title: 'Popular',
      dataIndex: 'popularity',
      sorter: true,
      width: '10%',
      valueEnum: {
        true: {
          text: 'Active',
        },
        false: {
          text: 'Inactive',
        },
      },
      onFilter: (value: any, record: BrandItem) => {
        const v = value.toLowerCase() === 'true';
        return record.active === v;
      },
      renderText: (text, record) => {
        const active = text === 'Active';
        if (record.default) return <Tag className="tag-primary-color">Default</Tag>;
        return <Switch defaultChecked={active} onChange={() => toggleActiveStatus(record.id)} />;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      sorter: true,
      valueType: 'dateTime',
      hideInSearch: true,
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status');
        if (`${status}` === '0') {
          return false;
        }
        if (`${status}` === '3') {
          return <Input {...rest} placeholder="请输入异常原因！" />;
        }
        return defaultRender(item);
      },
    },
    {
      title: 'Action',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record: BrandItem) => (
        <span onClick={() => onEditClickHandler(record)} className="table-operation">
          <a onClick={()=>history.push(`brands/update/${record.id}`)}>Edit</a>
        </span>
      ),
    },
  ];

  const expandable = {
    expandedRowKeys,
    onExpand: (expanded: boolean, record: any) => {
      setExpandedRowKeys(expanded ? [record.id] : []);
    },
    expandIcon: ({ expanded, onExpand, record }: any) =>
      expanded ? (
        <DownOutlined onClick={(e) => onExpand(record, e)} />
      ) : (
        <RightOutlined onClick={(e) => onExpand(record, e)} />
      ),
    expandedRowRender: (record: BrandItem) => (
      <div className={`customExpendableRow ${style.addressExpand}`}>
        <p>
          <span>Address : </span>
          <span>{record.address}</span>
        </p>
      </div>
    ),
    rowExpandable: () => true,
  };
  return (
    <PageHeaderWrapper>
      <IntlProvider value={enUSIntl}>
        <ProTable<BrandItem>
          loading={loading}
          className="OuterTable"
          headerTitle="Our brands"
          actionRef={actionRef}
          rowKey="id"
          search={{ searchText: 'Search', resetText: 'Rest', submitText: 'Submit' }}
          onChange={(_, _filter, _sorter) => {
            const sorterResult = _sorter as SorterResult<BrandItem>;
            if (sorterResult.field && sorterResult.order) {
              setSorter(`${sorterResult.field}_${sorterResult.order}`);
            } else setSorter('');
          }}
          params={{
            sorter,
          }}
          toolBarRender={(action, { selectedRowKeys }) => [
            <Button type="primary" onClick={() => history.push('brands/Create')}>
              <PlusOutlined /> New
            </Button>,
            selectedRowKeys && selectedRowKeys.length > 0 && (
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleBulkDelete(selectedRowKeys)}
              >
                Delete
              </Button>
            ),
          ]}
          tableAlertRender={false}
          request={(params) => fetchBrands(params)}
          columns={columns}
          rowSelection={{}}
          pagination={{ showTotal: (total) => `Total ${total} items` }}
          expandable={expandable}
        />
      </IntlProvider>

  
    </PageHeaderWrapper>
  );
};

export default connect(
  ({ brands, loading }: { brands: any; loading: { models: { [key: string]: boolean } } }) => ({
    brands,
    loading: loading.models.brands,
  }),
)(TableList);
