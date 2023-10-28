import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Tag, Col } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
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
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import ImportSanPham from "./ImportSanPham";
import AddChiTiet from "./AddChiTiet";
const { EditableRow, EditableCell } = EditableTableRow;

function SanPham({ match, history, permission }) {
  const { width, loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [ActiveModal, setActiveModal] = useState(false);
  const [ActiveModalAddChiTiet, setActiveModalAddChiTiet] = useState(false);
  const [infoSanPham, setInfoSanPham] = useState({});
  const [type, setType] = useState("add");
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
    dispatch(fetchStart(`SanPham?${param}`, "GET", null, "LIST"));
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
  const actionContent = (item) => {
    // const phanQuyenItem =
    //   permission && permission.edit ? (
    //     <Link
    //       to={{
    //         pathname: `${match.url}/${item.id}/quy-trinh`,
    //         state: { itemData: item },
    //       }}
    //       title="Quy trình"
    //     >
    //       <GatewayOutlined />
    //     </Link>
    //   ) : (
    //     <span disabled title="Quy trình">
    //       <GatewayOutlined />
    //     </span>
    //   );
    // const addItem =
    //   permission && permission.add
    //     ? {
    //         onClick: () => {
    //           setActiveModalAddChiTiet(true);
    //           setInfoSanPham({ ...item, sanPham_Id: item.id });
    //           setType("add");
    //         },
    //       }
    //     : { disabled: true };

    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item },
          }}
          title="Sửa sản phẩm"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa sản phẩm">
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission && permission.del && !item.isUsed
        ? { onClick: () => deleteItemFunc(item, "sản phẩm") }
        : { disabled: true };
    return (
      <div>
        {/* {phanQuyenItem}
        <Divider type="vertical" />
        <a {...addItem} title="Thêm chi tiết">
          <PlusCircleOutlined />
        </a>
        <Divider type="vertical" /> */}

        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa sản phẩm">
          <DeleteOutlined />
        </a>
      </div>
    );
  };
  // const actionContentChiTiet = (item) => {
  //   const editItem =
  //     permission && permission.edit
  //       ? {
  //           onClick: () => {
  //             setActiveModalAddChiTiet(true);
  //             setInfoSanPham(item);
  //             setType("edit");
  //           },
  //         }
  //       : { disabled: true };
  //   const deleteVal =
  //     permission && permission.del
  //       ? { onClick: () => deleteItemFunc(item, "chi tiết") }
  //       : { disabled: true };
  //   return (
  //     <div>
  //       <a {...editItem} title="Sửa chi tiết">
  //         <EditOutlined />
  //       </a>
  //       <Divider type="vertical" />
  //       <a {...deleteVal} title="Xóa chi tiết">
  //         <DeleteOutlined />
  //       </a>
  //     </div>
  //   );
  // };
  /**
   * deleteItemFunc: Xoá item theo item
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item, title) => {
    ModalDeleteConfirm(deleteItemAction, item, item.maSanPham, title);
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url =
      // item.maChiTiet
      //   ? `lkn_ChiTiet/${item.chiTiet_Id}`
      //   :
      `SanPham/${item.id}`;
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
  const handleImport = () => {
    setActiveModal(true);
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<ImportOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleImport}
          disabled={permission && !permission.add}
        >
          Import
        </Button>
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
  const { totalRow, totalPage, pageSize } = data;

  let dataList = reDataForTable(data.datalist, page, pageSize);
  /**
   * Hiển thị tag quyền
   *
   * @param {*} val
   * @returns
   */
  const renderMauSac = (val) => {
    const mauSac = JSON.parse(val);
    if (!isEmpty(mauSac)) {
      return map(mauSac, (item, index) => {
        let color = "green";
        return (
          <Tag key={index} color={color}>
            {item.tenMauSac}
          </Tag>
        );
      });
    }
    return null;
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
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maSanPham,
            value: d.maSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.maSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên sản phẩm",
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
      title: "Loại sản phẩm",
      dataIndex: "tenLoaiSanPham",
      key: "tenLoaiSanPham",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenLoaiSanPham,
            value: d.tenLoaiSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.tenLoaiSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Kích thước",
      dataIndex: "kichThuoc",
      key: "kichThuoc",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.kichThuoc,
            value: d.kichThuoc,
          };
        })
      ),
      onFilter: (value, record) => record.kichThuoc.includes(value),
      filterSearch: true,
    },
    {
      title: "Màu sắc",
      dataIndex: "mauSac",
      key: "mauSac",
      align: "center",
      render: (val) => renderMauSac(val),
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.mauSac,
            value: d.mauSac,
          };
        })
      ),
      onFilter: (value, record) => record.mauSac.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonViTinh,
            value: d.tenDonViTinh,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonViTinh.includes(value),
      filterSearch: true,
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
  ];

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
  // let renderChiTiet = [
  //   {
  //     title: "STT",
  //     dataIndex: "key",
  //     key: "key",
  //     align: "center",
  //     width: 45,
  //   },
  //   {
  //     title: "Mã chi tiết",
  //     dataIndex: "maChiTiet",
  //     key: "maChiTiet",
  //     align: "center",
  //   },
  //   {
  //     title: "Tên chi tiết",
  //     dataIndex: "tenChiTiet",
  //     key: "tenChiTiet",
  //     align: "center",
  //   },
  //   {
  //     title: "Đơn vị tính",
  //     dataIndex: "tenDonViTinh",
  //     key: "tenDonViTinh",
  //     align: "center",
  //   },
  //   {
  //     title: "Số lượng",
  //     dataIndex: "soLuongChiTiet",
  //     key: "soLuongChiTiet",
  //     align: "center",
  //   },
  //   {
  //     title: "Kích thước",
  //     dataIndex: "kichThuoc",
  //     key: "kichThuoc",
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

  // const columnChilden = map(renderChiTiet, (col) => {
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
        title="Sản phẩm"
        description="Danh sách sản phẩm"
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
          // expandable={{
          //   expandedRowRender: (record) => (
          //     <Table
          //       style={{ marginLeft: "80px", width: "80%" }}
          //       bordered
          //       columns={columnChilden}
          //       scroll={{ x: 500 }}
          //       components={components}
          //       className="gx-table-responsive th-F1D065-head"
          //       dataSource={reDataForTable(JSON.parse(record.chiTiet))}
          //       size="small"
          //       rowClassName={"editable-row"}
          //       loading={loading}
          //       pagination={false}
          //     />
          //   ),
          //   rowExpandable: (record) => record.name !== "Not Expandable",
          // }}
        />
      </Card>
      <ImportSanPham
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        refesh={refeshData}
      />
      <AddChiTiet
        openModal={ActiveModalAddChiTiet}
        openModalFS={setActiveModalAddChiTiet}
        sanPham={infoSanPham}
        type={type}
        refesh={() => loadData(keyword, page)}
      />
    </div>
  );
}

export default SanPham;
