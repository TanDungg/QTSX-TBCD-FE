import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Col, Popover, Tag } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEmpty, repeat } from "lodash";
import QRCode from "qrcode.react";
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
  reDataSelectedTable,
  removeDuplicates,
  treeToFlatlist,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import AddCauTrucKho from "./AddCauTrucKho";

const { EditableRow, EditableCell } = EditableTableRow;

function CauTrucKhoVatTu({ match, history, permission }) {
  const { width, loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState("");
  const [ActiveModal, setActiveModal] = useState(false);
  const [Type, setType] = useState();
  const [info, setInfo] = useState();
  useEffect(() => {
    if (permission && permission.view) {
      loadData(keyword, 1);
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
    dispatch(
      fetchStart(
        `tits_qtsx_CauTrucKho/cau-truc-kho-vat-tu-tree?${param}`,
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
  const onSearchCauTrucKho = () => {
    loadData(keyword, 1);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, 1);
    }
  };
  /**
   * Thêm dấu để phân cấp tiêu đề dựa theo tree (flatlist)
   *
   * @param {*} value
   * @param {*} record
   * @returns
   * @memberof ChucNang
   */
  const renderTenMenu = (value, record) => {
    let string = repeat("- ", record.level);
    string = `${string} ${value}`;
    return <div>{string}</div>;
  };

  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item, type) => {
    const addItem =
      permission && permission.add
        ? {
            onClick: () => {
              setActiveModal(true);
              setInfo(item);
              setType(type + "New");
            },
          }
        : { disabled: true };

    const editItem =
      permission && permission.edit ? (
        type === "kho" ? (
          <Link
            to={{
              pathname: `${match.url}/${item.id}/chinh-sua`,
              state: { itemData: item },
            }}
            title={"Sửa kho"}
          >
            <EditOutlined />
          </Link>
        ) : (
          <a
            title={
              type === "ke"
                ? "Sửa kệ"
                : type === "tang"
                ? "Sửa tầng"
                : "Sửa ngăn"
            }
            onClick={() => {
              setActiveModal(true);
              setInfo(item);
              setType(type + "Edit");
            }}
          >
            <EditOutlined />
          </a>
        )
      ) : (
        <span
          disabled
          title={
            type === "kho"
              ? "Sửa kho"
              : type === "ke"
              ? "Sửa kệ"
              : type === "tang"
              ? "Sửa tầng"
              : "Sửa ngăn"
          }
        >
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item, type) }
        : { disabled: true };
    return (
      <div>
        {type !== "ngan" && (
          <>
            <a
              {...addItem}
              title={
                type === "kho"
                  ? "Thêm kệ"
                  : type === "ke"
                  ? "Thêm tầng"
                  : type === "tang" && "Thêm ngăn"
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
            type === "kho"
              ? "Xóa kho"
              : type === "ke"
              ? "Xóa kệ"
              : type === "tang"
              ? "Xóa tầng"
              : "Xóa ngăn"
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
  const deleteItemFunc = (item, type) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.maCauTrucKho,
      type === "kho"
        ? "kho"
        : type === "ke"
        ? "kệ"
        : type === "tang"
        ? "tầng"
        : "ngăn"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_CauTrucKho/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        loadData(keyword, 1);
      })
      .catch((error) => console.error(error));
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
  let dataList = reDataForTable(data);
  // dataList = reDataSelectedTable(dataList);
  // let dataList = data;
  const renderChungTu = (val) => {
    const chungTu = val && val;
    if (!isEmpty(chungTu)) {
      return map(chungTu, (item, index) => {
        let color = "green";
        return (
          <Tag key={index} color={color}>
            {item.tenChungTu}
          </Tag>
        );
      });
    }
    return null;
  };
  let renderHead = (type) => {
    const render = [
      {
        title: "Chức năng",
        key: "action",
        align: "center",
        width: 110,
        render: (value) => actionContent(value, type),
      },
      {
        title: "STT",
        dataIndex: "key",
        key: "key",
        align: "center",
        width: 70,
      },
      {
        title:
          type === "kho"
            ? "Mã kho vật tư"
            : type === "ke"
            ? "Mã kệ"
            : type === "tang"
            ? "Mã tầng"
            : "Mã ngăn",
        dataIndex: "maCauTrucKho",
        align: "center",
        key: "maCauTrucKho",
        // render: (value, record) => renderTenMenu(value, record),
        filters: removeDuplicates(
          map(dataList, (d) => {
            return {
              text: d.maCauTrucKho,
              value: d.maCauTrucKho,
            };
          })
        ),
        onFilter: (value, record) => record.maCauTrucKho.includes(value),
        filterSearch: true,
      },
      {
        title:
          type === "kho"
            ? "Tên kho vật tư"
            : type === "ke"
            ? "Tên kệ"
            : type === "tang"
            ? "Tên tầng"
            : "Tên ngăn",
        dataIndex: "tenCauTrucKho",
        key: "tenCauTrucKho",
        align: "center",
        filters: removeDuplicates(
          map(dataList, (d) => {
            return {
              text: d.tenCauTrucKho,
              value: d.tenCauTrucKho,
            };
          })
        ),
        onFilter: (value, record) => record.tenCauTrucKho.includes(value),
        filterSearch: true,
      },
    ];
    const BarCode = [
      {
        title: "Mã Barcode",
        dataIndex: "id",
        key: "id",
        width: 100,
        align: "center",
        render: (value) => (
          <div id="myqrcode">
            <QRCode
              value={value}
              bordered={false}
              style={{ width: 50, height: 50 }}
            />
          </div>
        ),
      },
    ];
    return type === "kho"
      ? [
          ...render,
          {
            title: "Chứng từ",
            dataIndex: "chiTietChungTus",
            key: "chiTietChungTus",
            render: (val) => renderChungTu(val),
            align: "center",
          },
          ...BarCode,
        ]
      : [
          ...render,
          {
            title: "Vị trí",
            dataIndex: "viTri",
            key: "viTri",
            align: "center",
          },
          ...BarCode,
        ];
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = map(renderHead("kho"), (col) => {
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
  const columnKes = map(renderHead("ke"), (col) => {
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
  const columnTangs = map(renderHead("tang"), (col) => {
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
  const columnNgans = map(renderHead("ngan"), (col) => {
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
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Cấu trúc kho vật tư"
        description="Danh sách cấu trúc kho vật tư"
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
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchCauTrucKho,
                onSearch: onSearchCauTrucKho,
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
          pagination={false}
          loading={loading}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                style={{ marginLeft: "80px", width: "94.6%" }}
                bordered
                columns={columnKes}
                scroll={{ x: 500 }}
                components={components}
                className="gx-table-responsive th-F1D065-head"
                dataSource={reDataForTable(record.listChildren)}
                size="small"
                rowClassName={"editable-row"}
                // loading={loading}
                pagination={false}
                expandable={{
                  expandedRowRender: (record) => (
                    <Table
                      style={{ marginLeft: "80px", width: "94%" }}
                      bordered
                      columns={columnTangs}
                      scroll={{ x: 500 }}
                      components={components}
                      className="gx-table-responsive th-F1D065-head"
                      dataSource={reDataForTable(record.listChildren)}
                      size="small"
                      rowClassName={"editable-row"}
                      // loading={loading}
                      pagination={false}
                      expandable={{
                        expandedRowRender: (record) => (
                          <Table
                            style={{ marginLeft: "80px", width: "93.6%" }}
                            bordered
                            columns={columnNgans}
                            scroll={{ x: 500 }}
                            components={components}
                            className="gx-table-responsive th-F1D065-head"
                            dataSource={reDataForTable(record.listChildren)}
                            size="small"
                            rowClassName={"editable-row"}
                            // loading={loading}
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
      <AddCauTrucKho
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        info={info}
        type={Type}
        refesh={() => loadData(keyword, 1)}
      />
    </div>
  );
}

export default CauTrucKhoVatTu;
