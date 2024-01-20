import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Divider,
  Col,
  Modal as AntModal,
  Image,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEmpty } from "lodash";
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
  getLocalStorage,
  getTokenInfo,
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;

function DanhSachChiTiet({ match, history, permission }) {
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [DisabledModal, setDisabledModal] = useState(false);
  const [DataChiTiet, setDataChiTiet] = useState([]);
  const [ChiTiet, setChiTiet] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      loadData(keyword, page);
    } else if (permission && !permission.view) {
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
    const param = convertObjectToUrlParams({
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ChiTiet?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          const newData = res.data.datalist.map((data) => {
            const quycach =
              data.thongSoKyThuat && JSON.parse(data.thongSoKyThuat);
            return {
              ...data,
              ...quycach,
              thongSoKyThuat: quycach && quycach,
            };
          });
          setData({ ...res.data, datalist: newData });
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchPhieuNhanHang = () => {
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
      permission && permission.edit && item.nguoiTao_Id === INFO.user_Id ? (
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
      permission && permission.del && item.nguoiTao_Id === INFO.user_Id
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
    ModalDeleteConfirm(deleteItemAction, item, item.maChiTiet, "chi tiết");
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_ChiTiet/${item.id}`;
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
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Tạo mới
        </Button>
      </>
    );
  };
  const { totalRow, pageSize } = data;

  let dataList = reDataForTable(data.datalist, page, pageSize);

  const XemChiTiet = (record) => {
    setChiTiet(record);
    const newData =
      record.ChiTietChild &&
      JSON.parse(record.ChiTietChild).map((data) => {
        const quycach = data.thongSoKyThuat && JSON.parse(data.thongSoKyThuat);
        return {
          ...data,
          ...quycach,
          thongSoKyThuat: quycach && quycach,
        };
      });
    setDataChiTiet(reDataForTable(newData));
    setDisabledModal(true);
  };

  const renderDetail = (record) => {
    return (
      <div>
        <span
          style={{
            color: "#0469b9",
            cursor: "pointer",
          }}
          onClick={() => XemChiTiet(record)}
        >
          {record && record.maChiTiet}
        </span>
      </div>
    );
  };

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã chi tiết",
      key: "maChiTiet",
      align: "center",
      render: (record) => renderDetail(record),
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maChiTiet,
            value: d.maChiTiet,
          };
        })
      ),
      onFilter: (value, record) => record.maChiTiet.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenChiTiet,
            value: d.tenChiTiet,
          };
        })
      ),
      onFilter: (value, record) => record.tenChiTiet.includes(value),
      filterSearch: true,
    },
    {
      title: "Thông số",
      dataIndex: "thongSoKyThuat",
      key: "thongSoKyThuat",
      align: "center",
      children: [
        {
          title: "Dài",
          dataIndex: "dai",
          key: "dai",
          align: "center",
          width: 50,
        },
        {
          title: "Rộng",
          dataIndex: "rong",
          key: "rong",
          align: "center",
          width: 50,
        },
        {
          title: "Dày",
          dataIndex: "day",
          key: "day",
          align: "center",
          width: 50,
        },
        {
          title: "Dn",
          dataIndex: "dn",
          key: "dn",
          align: "center",
          width: 50,
        },
        {
          title: "Dt",
          dataIndex: "dt",
          key: "dt",
          align: "center",
          width: 50,
        },
        {
          title: "Chung",
          dataIndex: "chung",
          key: "chung",
          align: "center",
          width: 55,
        },
      ],
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenSanPham,
            value: d.tenSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.tenSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenCongDoan,
            value: d.tenCongDoan,
          };
        })
      ),
      onFilter: (value, record) => record.tenCongDoan.includes(value),
      filterSearch: true,
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ maxWidth: 70, maxHeight: 70 }}
            />
          </span>
        ),
    },
    {
      title: "File đính kèm",
      dataIndex: "fileDinhKem",
      key: "fileDinhKem",
      align: "center",
      render: (value) =>
        value && (
          <a
            href={BASE_URL_API + value}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value && value.split("/")[5]}
          </a>
        ),
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
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
      }),
    };
  });

  let colChiTiet = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã chi tiết",
      dataIndex: "maChiTiet",
      key: "maChiTiet",
      align: "center",
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "center",
    },
    {
      title: "Thông số",
      dataIndex: "thongSoKyThuat",
      key: "thongSoKyThuat",
      align: "center",
      children: [
        {
          title: "Dài",
          dataIndex: "dai",
          key: "dai",
          align: "center",
          width: 50,
        },
        {
          title: "Rộng",
          dataIndex: "rong",
          key: "rong",
          align: "center",
          width: 50,
        },
        {
          title: "Dày",
          dataIndex: "day",
          key: "day",
          align: "center",
          width: 50,
        },
        {
          title: "Dn",
          dataIndex: "dn",
          key: "dn",
          align: "center",
          width: 50,
        },
        {
          title: "Dt",
          dataIndex: "dt",
          key: "dt",
          align: "center",
          width: 50,
        },
        {
          title: "Chung",
          dataIndex: "chung",
          key: "chung",
          align: "center",
          width: 55,
        },
      ],
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ maxWidth: 50, maxHeight: 50 }}
            />
          </span>
        ),
    },
    {
      title: "File đính kèm",
      dataIndex: "fileDinhKem",
      key: "fileDinhKem",
      align: "center",
      render: (value) =>
        value && (
          <a
            href={BASE_URL_API + value}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value && value.split("/")[5]}
          </a>
        ),
    },
  ];

  const componentschitiet = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columnschitiet = map(colChiTiet, (col) => {
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
      }),
    };
  });

  const title = (
    <span>
      Danh sách chi tiết của{" "}
      <Tag color={"darkcyan"} style={{ fontSize: "14px" }}>
        {ChiTiet && ChiTiet.tenChiTiet}
      </Tag>
    </span>
  );

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Danh sách chi tiết"
        description="Danh sách chi tiết"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom ">
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
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchPhieuNhanHang,
                onSearch: onSearchPhieuNhanHang,
                allowClear: true,
                placeholder: "Tìm kiếm",
              }}
            />
          </div>
        </Col>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1200, y: "48vh" }}
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
      <AntModal
        title={title}
        className="th-card-reset-margin"
        open={DisabledModal}
        width={width > 1200 ? `80%` : "100%"}
        closable={true}
        onCancel={() => setDisabledModal(false)}
        footer={null}
      >
        <Table
          bordered
          columns={columnschitiet}
          components={componentschitiet}
          scroll={{ x: 1200, y: "40vh" }}
          className="gx-table-responsive"
          dataSource={DataChiTiet}
          size="small"
          loading={loading}
          pagination={false}
        />
      </AntModal>
    </div>
  );
}

export default DanhSachChiTiet;
