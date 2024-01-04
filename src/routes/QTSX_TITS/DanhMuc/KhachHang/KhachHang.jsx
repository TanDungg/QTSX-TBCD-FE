import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Col } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, find, isEmpty } from "lodash";

import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
  Toolbar,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  treeToFlatlist,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

const { EditableRow, EditableCell } = EditableTableRow;

function KhachHang({ match, history, permission }) {
  const { width, loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (permission && permission.view) {
      loadData(keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy dữ liệu về
   *
   */
  const loadData = (keyword, page) => {
    const param = convertObjectToUrlParams({ keyword, page });
    dispatch(fetchStart(`tits_qtsx_KhachHang?${param}`, "GET", null, "LIST"));
  };
  const { totalRow, pageSize } = data;

  let dataList = reDataForTable(data.datalist, page, pageSize);
  /**
   * Tìm kiếm khách hàng
   *
   */
  const onSearchKhachHang = () => {
    loadData(keyword, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, page);
    }
  };
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item },
          }}
          title="Sửa"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa">
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission && permission.del && !item.isUsed
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  /**
   * deleteItemFunc: Xoá item theo item
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.maKhachHang, "khách hàng");
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_KhachHang/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          loadData(keyword, page);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * handleTableChange
   *
   * Fetch dữ liệu dựa theo thay đổi trang
   * @param {number} pagination
   */
  const handleTableChange = (pagination) => {
    setPage(pagination);
    loadData(keyword, pagination);
  };

  /**
   * Chuyển tới trang thêm mới chức năng
   *
   * @memberof ChucNang
   */
  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  /**
   * Lưu thứ tự từ bảng
   * @param {object} row dữ liệu một hàng
   * @memberof ChucNang
   */
  const handleSave = async (row) => {
    const dataValue = treeToFlatlist(data);
    // Check data not change
    const item = find(dataValue, (item) => item.id === row.id);
    if (!isEmpty(item)) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Menu/ThuTu/${item.id}`,
            "PUT",
            {
              ...item,
              thuTu: row.thuTu,
            },
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status === 204) {
            loadData();
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const addButtonRender = () => {
    return (
      <Button
        icon={<PlusOutlined />}
        className="th-margin-bottom-0"
        type="primary"
        onClick={handleRedirect}
        disabled={permission && !permission.add}
      >
        Thêm mới
      </Button>
    );
  };

  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã khách hàng",
      dataIndex: "maKhachHang",
      key: "maKhachHang",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maKhachHang,
            value: d.maKhachHang,
          };
        })
      ),
      onFilter: (value, record) => record.maKhachHang.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "tenKhachHang",
      key: "tenKhachHang",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenKhachHang,
            value: d.tenKhachHang,
          };
        })
      ),
      onFilter: (value, record) => record.tenKhachHang.includes(value),
      filterSearch: true,
    },
    {
      title: "Người liên hệ",
      dataIndex: "nguoiLienHe",
      key: "nguoiLienHe",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.nguoiLienHe,
            value: d.nguoiLienHe,
          };
        })
      ),
      onFilter: (value, record) => record.nguoiLienHe.includes(value),
      filterSearch: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "diaChi",
      key: "diaChi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.diaChi,
            value: d.diaChi,
          };
        })
      ),
      onFilter: (value, record) => record.diaChi.includes(value),
      filterSearch: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "sDT",
      key: "sDT",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.sDT,
            value: d.sDT,
          };
        })
      ),
      onFilter: (value, record) => record.sDT.includes(value),
      filterSearch: true,
    },
    {
      title: "Fax",
      dataIndex: "fax",
      key: "fax",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.fax,
            value: d.fax,
          };
        })
      ),
      onFilter: (value, record) => record.fax.includes(value),
      filterSearch: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.email,
            value: d.email,
          };
        })
      ),
      onFilter: (value, record) => record.email.includes(value),
      filterSearch: true,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = map(renderHead, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
        handleSave: handleSave,
      }),
    };
  });

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Khách hàng"
        description="Danh sách khách hàng"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom">
        <Col
          xxl={8}
          xl={12}
          lg={16}
          md={16}
          sm={20}
          xs={24}
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              width: "80px",
            }}
          >
            Tìm kiếm:
          </span>
          <div
            style={{
              flex: 1,
              alignItems: "center",
              marginTop: width < 576 ? 10 : 0,
            }}
          >
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchKhachHang,
                onSearch: onSearchKhachHang,
                placeholder: "Nhập từ khóa",
                allowClear: true,
              }}
            />
          </div>
        </Col>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 700, y: "70vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={(record) => {
            return record.isParent ? "editable-row" : "editable-row";
          }}
          pagination={{
            onChange: handleTableChange,
            pageSize: pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default KhachHang;
