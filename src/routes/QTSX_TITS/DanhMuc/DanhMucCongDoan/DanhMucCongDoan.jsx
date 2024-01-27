import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Col } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
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
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import AddChiTietCongDoan from "./AddChiTietCongDoan";
const { EditableRow, EditableCell } = EditableTableRow;

function DanhMucCongDoan({ match, history, permission }) {
  const { width, loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [keyword, setKeyword] = useState("");
  const [ActiveModal, setActiveModal] = useState(false);
  const [type, setType] = useState();
  const [info, setInfo] = useState();

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
    const param = convertObjectToUrlParams({
      keyword,
      page,
      donVi_Id: INFO.donVi_Id,
    });
    dispatch(
      fetchStart(
        `tits_qtsx_CongDoan/cong-doan-tree?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchSanPham = () => {
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
  const actionContent = (item, ma) => {
    const addItem =
      permission && permission.add
        ? {
            onClick: () => {
              setActiveModal(true);
              setInfo(item);
              setType(ma + "New");
            },
          }
        : { disabled: true };

    const editItem =
      permission && permission.edit ? (
        ma === "congDoan" ? (
          <Link
            to={{
              pathname: `${match.url}/${item.id}/chinh-sua`,
              state: { itemData: item },
            }}
            title="Sửa công đoạn"
          >
            <EditOutlined />
          </Link>
        ) : (
          <span
            style={{
              color: "#0469b9",
              cursor: "pointer",
            }}
            title={
              ma === "xuong"
                ? "Sửa xưởng"
                : ma === "chuyen"
                ? "Sửa chuyền"
                : "Sửa trạm"
            }
            onClick={() => {
              setActiveModal(true);
              setInfo(item);
              setType(ma + "Edit");
            }}
          >
            <EditOutlined />
          </span>
        )
      ) : (
        <span disabled title="Sửa công đoạn">
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission && permission.del && !item.isUsed
        ? {
            onClick: () =>
              deleteItemFunc(
                item,
                ma === "congDoan"
                  ? "Công đoạn"
                  : ma === "chuyen"
                  ? "Chuyền"
                  : ma === "xuong"
                  ? "Xưởng"
                  : "Trạm",
                ma
              ),
          }
        : { disabled: true };
    return (
      <div>
        {ma !== "tram" && (
          <>
            <a
              {...addItem}
              title={
                ma === "congDoan"
                  ? "Thêm xưởng"
                  : ma === "xuong"
                  ? "Thêm chuyền"
                  : ma === "chuyen" && "Thêm trạm"
              }
            >
              <PlusCircleOutlined />
            </a>
            <Divider type="vertical" />
          </>
        )}
        {editItem}
        <Divider type="vertical" />
        <a
          {...deleteVal}
          title={
            ma === "congDoan"
              ? "Xóa công đoạn"
              : ma === "chuyen"
              ? "Xóa chuyền"
              : ma === "xuong"
              ? "Xóa xưởng"
              : "Xóa trạm"
          }
        >
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
  const deleteItemFunc = (item, title, ma) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      ma === "congDoan"
        ? item.tenCongDoan
        : ma === "xuong"
        ? item.tenXuong
        : ma === "chuyen"
        ? item.tenChuyen
        : item.tenTram,
      title
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url =
      item.tenCongDoan && !item.tenXuong
        ? `tits_qtsx_CongDoan/${item.id}`
        : item.tenXuong && !item.tenChuyen
        ? `tits_qtsx_Xuong/${item.id}`
        : item.tenChuyen && !item.tenTram
        ? `tits_qtsx_Chuyen/${item.id}`
        : `tits_qtsx_Tram/${item.id}`;
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
          Thêm mới
        </Button>
      </>
    );
  };
  const { totalRow, pageSize } = data;

  let dataList = reDataForTable(data.datalist, page, pageSize);

  let renderHead = (ma) => {
    const render = [
      {
        title: "Chức năng",
        key: "action",
        align: "center",
        width: 110,
        render: (value) => actionContent(value, ma),
      },
      {
        title: "STT",
        dataIndex: "key",
        key: "key",
        align: "center",
        width: 45,
      },
      {
        title:
          ma === "congDoan"
            ? "Mã công đoạn"
            : ma === "xuong"
            ? "Mã xưởng"
            : ma === "chuyen"
            ? "Mã chuyền"
            : "Mã trạm",
        dataIndex:
          ma === "congDoan"
            ? "maCongDoan"
            : ma === "xuong"
            ? "maXuong"
            : ma === "chuyen"
            ? "maChuyen"
            : "maTram",
        key:
          ma === "congDoan"
            ? "maCongDoan"
            : ma === "xuong"
            ? "maXuong"
            : ma === "chuyen"
            ? "maChuyen"
            : "maTram",
        align: "center",
      },
      {
        title:
          ma === "congDoan"
            ? "Tên công đoạn"
            : ma === "xuong"
            ? "Tên xưởng"
            : ma === "chuyen"
            ? "Tên chuyền"
            : "Tên trạm",
        dataIndex:
          ma === "congDoan"
            ? "tenCongDoan"
            : ma === "xuong"
            ? "tenXuong"
            : ma === "chuyen"
            ? "tenChuyen"
            : "tenTram",
        key:
          ma === "congDoan"
            ? "tenCongDoan"
            : ma === "xuong"
            ? "tenXuong"
            : ma === "chuyen"
            ? "tenChuyen"
            : "tenTram",
        align: "center",
      },
    ];
    ma === "congDoan"
      ? render.push(
          {
            title: ma === "congDoan" && "Đơn vị",
            dataIndex: ma === "congDoan" && "tenDonVi",
            key: ma === "congDoan" && "tenDonVi",
            align: "center",
          },
          {
            title: "Thứ tự",
            dataIndex: "thuTu",
            key: "thuTu",
            align: "center",
          },
          {
            title: "Ghi chú",
            dataIndex: "moTa",
            key: "moTa",
            align: "center",
          }
        )
      : render.push(
          {
            title: "Thứ tự",
            dataIndex: "thuTu",
            key: "thuTu",
            align: "center",
          },
          {
            title: "Ghi chú",
            dataIndex: "moTa",
            key: "moTa",
            align: "center",
          }
        );
    return render;
  };

  const columns = map(renderHead("congDoan"), (col) => {
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
  const columnsChuyen = map(renderHead("chuyen"), (col) => {
    if (col && !col.editable) {
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
  const columnsXuong = map(renderHead("xuong"), (col) => {
    if (col && !col.editable) {
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
  const columnsTram = map(renderHead("tram"), (col) => {
    if (col && col.editable) {
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
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const refeshData = () => {
    loadData(keyword, page);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Danh mục công đoạn"
        description="Danh mục công đoạn"
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
                onPressEnter: onSearchSanPham,
                onSearch: onSearchSanPham,
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
          scroll={{ x: 1200, y: "70vh" }}
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
          expandable={{
            expandedRowRender: (record) => (
              <Table
                style={{ marginLeft: "50px", width: "94.6%" }}
                bordered
                columns={columnsXuong}
                scroll={{ x: 900 }}
                components={components}
                className="gx-table-responsive th-F1D065-head"
                dataSource={reDataForTable(record.chiTietXuongs)}
                size="small"
                rowClassName={"editable-row"}
                loading={loading}
                pagination={false}
                expandable={{
                  expandedRowRender: (record) => (
                    <Table
                      style={{ marginLeft: "50px", width: "94%" }}
                      bordered
                      columns={columnsChuyen}
                      scroll={{ x: 900 }}
                      components={components}
                      className="gx-table-responsive th-F1D065-head"
                      dataSource={reDataForTable(record.chiTietChuyens)}
                      size="small"
                      rowClassName={"editable-row"}
                      loading={loading}
                      pagination={false}
                      expandable={{
                        expandedRowRender: (record) => (
                          <Table
                            style={{ marginLeft: "50px", width: "93.6%" }}
                            bordered
                            columns={columnsTram}
                            scroll={{ x: 900 }}
                            components={components}
                            className="gx-table-responsive th-F1D065-head"
                            dataSource={reDataForTable(record.chiTietTrams)}
                            size="small"
                            rowClassName={"editable-row"}
                            loading={loading}
                            pagination={false}
                          />
                        ),
                      }}
                    />
                  ),
                }}
              />
            ),
          }}
        />
      </Card>
      <AddChiTietCongDoan
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        info={info}
        type={type}
        refesh={refeshData}
      />
    </div>
  );
}

export default DanhMucCongDoan;
