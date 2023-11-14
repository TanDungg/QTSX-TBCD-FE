import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Col, Popover, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
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
  reDataSelectedTable,
  removeDuplicates,
  treeToFlatlist,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

const { EditableRow, EditableCell } = EditableTableRow;

function CauTrucKhoVatTu({ match, history, permission }) {
  const { width, loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState("");
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
        `tits_qtsx_CauTrucKho/cau-truc-kho-thanh-pham-tree?${param}`,
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
      permission && permission.del
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
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.maCauTrucKho,
      "cấu trúc kho"
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
  let dataList = treeToFlatlist(data);
  dataList = reDataSelectedTable(dataList);
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
  let renderHead = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
      width: 70,
    },
    {
      title: "Mã cấu trúc kho",
      dataIndex: "maCauTrucKho",
      key: "maCauTrucKho",
      render: (value, record) => renderTenMenu(value, record),
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
      title: "Tên cấu trúc kho",
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
    {
      title: "Sức chứa",
      dataIndex: "sucChua",
      key: "sucChua",
      align: "center",
      render: (val) => <span>{val !== 0 && val}</span>,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.sucChua,
            value: d.sucChua,
          };
        })
      ),
      onFilter: (value, record) => record.sucChua.includes(value),
      filterSearch: true,
    },
    {
      title: "Mã Barcode",
      dataIndex: "nameId",
      key: "nameId",
      align: "center",
      render: (value) => (
        <div id="myqrcode">
          <Popover content={value}>
            <QRCode
              value={value}
              bordered={false}
              style={{ width: 50, height: 50 }}
            />
          </Popover>
        </div>
      ),
    },
    {
      title: "Vị trí",
      dataIndex: "viTri",
      key: "viTri",
      align: "center",
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
  // const actionContentChiTiet = (item) => {
  //   const deleteItemVal = "";
  //   // permission && permission.del && (type === "new" || type === "edit");
  //   // ? { onClick: () => deleteItemFuncChiTiet(item) }
  //   // :
  //   // {
  //   //   disabled: true;
  //   // }
  //   return (
  //     <div>
  //       <React.Fragment>
  //         <a {...deleteItemVal} title="Xóa">
  //           <DeleteOutlined />
  //         </a>
  //       </React.Fragment>
  //     </div>
  //   );
  // };
  // let renderKe = [
  //   {
  //     title: "STT",
  //     dataIndex: "key",
  //     key: "key",
  //     align: "center",
  //     width: 45,
  //   },
  //   {
  //     title: "Mã kệ",
  //     dataIndex: "maCauTrucKho",
  //     key: "maCauTrucKho",
  //     align: "center",
  //   },
  //   {
  //     title: "Tên kệ",
  //     dataIndex: "tenCauTrucKho",
  //     key: "tenCauTrucKho",
  //     align: "center",
  //   },
  //   {
  //     title: "Tên Ban/Phòng",
  //     dataIndex: "tenPhongBan",
  //     key: "tenPhongBan",
  //     align: "center",
  //   },
  //   {
  //     title: "Mã barcode",
  //     dataIndex: "qrCode",
  //     align: "center",
  //     key: "qrCode",
  //     render: (value) => (
  //       <div id="myqrcode">
  //         <Popover content={value}>
  //           <QRCode
  //             value={value}
  //             bordered={false}
  //             style={{ width: 50, height: 50 }}
  //           />
  //         </Popover>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Vị trí",
  //     dataIndex: "viTri",
  //     key: "viTri",
  //     align: "center",
  //   },
  //   {
  //     title: "Chức năng",
  //     key: "action",
  //     align: "center",
  //     width: 100,
  //     render: (value) => actionContentChiTiet(value),
  //   },
  // ];
  // const columnKe = map(renderKe, (col) => {
  //   if (!col.editable) {
  //     return col;
  //   }
  //   return {
  //     ...col,
  //     onCell: (record) => ({
  //       record,
  //       editable: col.editable,
  //       dataIndex: col.dataIndex,
  //       title: col.title,
  //       info: col.info,
  //     }),
  //   };
  // });
  // let renderTang = [
  //   {
  //     title: "STT",
  //     dataIndex: "key",
  //     key: "key",
  //     align: "center",
  //     width: 45,
  //   },
  //   {
  //     title: "Mã tầng",
  //     dataIndex: "maCauTrucKho",
  //     key: "maCauTrucKho",
  //     align: "center",
  //   },
  //   {
  //     title: "Tên tầng",
  //     dataIndex: "tenCauTrucKho",
  //     key: "tenCauTrucKho",
  //     align: "center",
  //   },
  //   {
  //     title: "Tên Ban/Phòng",
  //     dataIndex: "tenPhongBan",
  //     key: "tenPhongBan",
  //     align: "center",
  //   },
  //   {
  //     title: "Mã barcode",
  //     dataIndex: "qrCode",
  //     align: "center",
  //     key: "qrCode",
  //     render: (value) => (
  //       <div id="myqrcode">
  //         <Popover content={value}>
  //           <QRCode
  //             value={value}
  //             bordered={false}
  //             style={{ width: 50, height: 50 }}
  //           />
  //         </Popover>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Vị trí",
  //     dataIndex: "viTri",
  //     key: "viTri",
  //     align: "center",
  //   },
  //   {
  //     title: "Chức năng",
  //     key: "action",
  //     align: "center",
  //     width: 100,
  //     render: (value) => actionContentChiTiet(value),
  //   },
  // ];
  // const columnTang = map(renderTang, (col) => {
  //   if (!col.editable) {
  //     return col;
  //   }
  //   return {
  //     ...col,
  //     onCell: (record) => ({
  //       record,
  //       editable: col.editable,
  //       dataIndex: col.dataIndex,
  //       title: col.title,
  //       info: col.info,
  //     }),
  //   };
  // });
  // let renderNgan = [
  //   {
  //     title: "STT",
  //     dataIndex: "key",
  //     key: "key",
  //     align: "center",
  //     width: 45,
  //   },
  //   {
  //     title: "Mã ngăn",
  //     dataIndex: "maCauTrucKho",
  //     key: "maCauTrucKho",
  //     align: "center",
  //   },
  //   {
  //     title: "Tên ngăn",
  //     dataIndex: "tenCauTrucKho",
  //     key: "tenCauTrucKho",
  //     align: "center",
  //   },
  //   {
  //     title: "Tên Ban/Phòng",
  //     dataIndex: "tenPhongBan",
  //     key: "tenPhongBan",
  //     align: "center",
  //   },
  //   {
  //     title: "Mã barcode",
  //     dataIndex: "qrCode",
  //     align: "center",
  //     key: "qrCode",
  //     render: (value) => (
  //       <div id="myqrcode">
  //         <Popover content={value}>
  //           <QRCode
  //             value={value}
  //             bordered={false}
  //             style={{ width: 50, height: 50 }}
  //           />
  //         </Popover>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Vị trí",
  //     dataIndex: "viTri",
  //     key: "viTri",
  //     align: "center",
  //   },
  //   {
  //     title: "Chức năng",
  //     key: "action",
  //     align: "center",
  //     width: 100,
  //     render: (value) => actionContentChiTiet(value),
  //   },
  // ];
  // const columnNgan = map(renderNgan, (col) => {
  //   if (!col.editable) {
  //     return col;
  //   }
  //   return {
  //     ...col,
  //     onCell: (record) => ({
  //       record,
  //       editable: col.editable,
  //       dataIndex: col.dataIndex,
  //       title: col.title,
  //       info: col.info,
  //     }),
  //   };
  // });
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Cấu trúc kho thành phẩm"
        description="Danh sách cấu trúc kho thành phẩm"
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
          // expandable={{
          //   expandedRowRender: (record) => (
          //     <Table
          //       style={{ marginLeft: "80px", width: "80%" }}
          //       bordered
          //       columns={columnKe}
          //       scroll={{ x: 500 }}
          //       components={components}
          //       className="gx-table-responsive th-F1D065-head"
          //       dataSource={reDataForTable(record.children)}
          //       size="small"
          //       rowClassName={"editable-row"}
          //       // loading={loading}
          //       pagination={false}
          //       expandable={{
          //         expandedRowRender: (record) => (
          //           <Table
          //             style={{ marginLeft: "80px", width: "80%" }}
          //             bordered
          //             columns={columnTang}
          //             scroll={{ x: 500 }}
          //             components={components}
          //             className="gx-table-responsive th-F1D065-head"
          //             dataSource={reDataForTable(record.children)}
          //             size="small"
          //             rowClassName={"editable-row"}
          //             // loading={loading}
          //             pagination={false}
          //             expandable={{
          //               expandedRowRender: (record) => (
          //                 <Table
          //                   style={{ marginLeft: "80px", width: "80%" }}
          //                   bordered
          //                   columns={columnNgan}
          //                   scroll={{ x: 500 }}
          //                   components={components}
          //                   className="gx-table-responsive th-F1D065-head"
          //                   dataSource={reDataForTable(record.children)}
          //                   size="small"
          //                   rowClassName={"editable-row"}
          //                   // loading={loading}
          //                   pagination={false}
          //                 />
          //               ),
          //             }}
          //           />
          //         ),
          //       }}
          //     />
          //   ),
          // }}
        />
      </Card>
    </div>
  );
}

export default CauTrucKhoVatTu;
