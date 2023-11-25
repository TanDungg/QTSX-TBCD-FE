import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col, Divider } from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { map, find, isEmpty, remove } from "lodash";
import {
  Table,
  EditableTableRow,
  Toolbar,
  Select,
  ModalDeleteConfirm,
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
import { Link } from "react-router-dom";
import ModalAddViTri from "./ModalAddViTri";
const { EditableRow, EditableCell } = EditableTableRow;
function KhoVatTu({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [ListVatTuSelected, setListVatTuSelected] = useState([]);

  const [selectedKeys, setSelectedKeys] = useState([]);
  const [ListKho, setListKho] = useState([]);
  const [Kho, setKho] = useState("");
  const [ActiveModal, setActiveModal] = useState(false);
  const [KeyViTri, setKeyViTri] = useState("add");

  useEffect(() => {
    if (permission && permission.view) {
      getKho();
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
  const loadData = (keyword, tits_qtsx_CauTrucKho_Id, page) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
      keyword,
      page,
    });
    dispatch(
      fetchStart(
        `tits_qtsx_ViTriLuuKhoVatTu/list-vi-tri-luu-kho-vat-tu?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };
  const refesh = () => {
    loadData(keyword, Kho, page);
    setSelectedKeys([]);
    setListVatTuSelected([]);
  };
  const getKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&&isThanhPham=false`,
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
          setKho(res.data[0].id);
          loadData(keyword, res.data[0].id, page);
          setListKho(res.data);
        } else {
          setListKho([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchVatTu = () => {
    loadData(keyword, Kho, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, Kho, page);
    }
  };
  /**
   * handleTableChange
   *
   * Fetch dữ liệu dựa theo thay đổi trang
   * @param {number} pagination
   */
  const handleTableChange = (pagination) => {
    setPage(pagination);
    loadData(keyword, Kho, pagination);
  };

  /**
   * Chuyển tới trang thêm mới chức năng
   *
   * @memberof ChucNang
   */
  const handleRedirect = () => {
    setActiveModal(true);
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<EditOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={
            (permission && !permission.add) || ListVatTuSelected.length === 0
          }
        >
          Vị trí
        </Button>
      </>
    );
  };
  const { totalRow, pageSize } = data;
  let dataList = reDataForTable(data.splice((vt) => vt.soLuong !== 0));
  /**
   * deleteItemFunc: Xoá item theo item
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.maVatTu, "vị trí");
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_ViTriLuuKhoVatTu/huy-vi-tri-luu-kho-vat-tu?id=${item.tits_qtsx_ChiTietKhoVatTu_Id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "PUT", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          loadData(keyword, Kho, page);
        }
      })
      .catch((error) => console.error(error));
  };
  const actionContent = (item) => {
    const addItem =
      permission && permission.add && !item.tits_qtsx_Ke_Id
        ? {
            onClick: () => {
              setActiveModal(true);
              setListVatTuSelected(item);
              setKeyViTri("add");
            },
          }
        : { disabled: true };
    const editItem =
      permission && permission.edit && item.tits_qtsx_Ke_Id
        ? {
            onClick: () => {
              setActiveModal(true);
              setListVatTuSelected(item);
              setKeyViTri("edit");
            },
          }
        : { disabled: true };
    const deleteVal =
      permission && permission.del && item.tits_qtsx_Ke_Id
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <a {...addItem} title="Thêm vị trí">
          <PlusCircleOutlined />
        </a>
        <Divider type="vertical" />
        <a {...editItem} title="Sửa vị trí">
          <EditOutlined />
        </a>
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa vị trí">
          <DeleteOutlined />
        </a>
      </div>
    );
  };
  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
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
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maVatTu,
            value: d.maVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenVatTu,
            value: d.tenVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày nhập kho",
      dataIndex: "ngayNhapKho",
      key: "ngayNhapKho",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayNhapKho,
            value: d.ngayNhapKho,
          };
        })
      ),
      onFilter: (value, record) => record.ngayNhapKho.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
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
      title: "Kho",
      dataIndex: "tenKho",
      key: "tenKho",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenKho,
            value: d.tenKho,
          };
        })
      ),
      onFilter: (value, record) => record.tenKho.includes(value),
      filterSearch: true,
    },
    {
      title: "Vị trí lưu",
      key: "viTriLuu",
      align: "center",
      render: (val) => {
        return (
          <span>
            {val.tenKe && val.tenKe}
            {val.tenTang && ` - ${val.tenTang}`}
            {val.tenNgan && ` - ${val.tenNgan}`}
          </span>
        );
      },
    },
    // {
    //   title: "Hạn sử dụng",
    //   dataIndex: "thoiGianSuDung",
    //   key: "thoiGianSuDung",
    //   align: "center",
    // },
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

  function hanldeRemoveSelected(device) {
    const newDevice = remove(ListVatTuSelected, (d) => {
      return d.key !== device.key;
    });
    const newKeys = remove(selectedKeys, (d) => {
      return d !== device.key;
    });
    setListVatTuSelected(newDevice);
    setSelectedKeys(newKeys);
  }

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: ListVatTuSelected,
    onChange: (selectedRowKeys, selectedRows) => {
      const newListVatTuSelected =
        ListVatTuSelected.length > 0
          ? selectedRows.filter((d) => d.key !== ListVatTuSelected[0].key)
          : [...selectedRows];
      const newSelectedKey =
        selectedKeys.length > 0
          ? selectedRowKeys.filter((d) => d !== selectedKeys[0])
          : [...selectedRowKeys];

      setListVatTuSelected(newListVatTuSelected);
      setSelectedKeys(newSelectedKey);
    },
  };
  const handleOnSelectKho = (val) => {
    setKho(val);
    setPage(1);
    loadData(keyword, val, 1);
    setSelectedKeys([]);
    setListVatTuSelected([]);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Kho vật tư"
        description="Kho vật tư"
        // buttons={addButtonRender()}
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Kho:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKho ? ListKho : []}
              placeholder="Chọn kho"
              optionsvalue={["id", "tenCauTrucKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKho}
              value={Kho}
              onChange={(value) => setKho(value)}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchVatTu,
                onSearch: onSearchVatTu,
                allowClear: true,
                placeholder: "Tìm kiếm",
              }}
            />
          </Col>
        </Row>
        <Table
          // rowSelection={{
          //   type: "checkbox",
          //   ...rowSelection,
          //   preserveSelectedRowKeys: true,
          //   selectedRowKeys: selectedKeys,
          //   hideSelectAll: true,
          //   getCheckboxProps: (record) => ({}),
          // }}
          // onRow={(record, rowIndex) => {
          //   return {
          //     onClick: (e) => {
          //       const found = find(selectedKeys, (k) => k === record.key);
          //       if (found === undefined) {
          //         setListVatTuSelected([record]);
          //         setSelectedKeys([record.key]);
          //       } else {
          //         hanldeRemoveSelected(record);
          //       }
          //     },
          //   };
          // }}
          bordered
          scroll={{ x: 700, y: "60vh" }}
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
      <ModalAddViTri
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        vatTu={ListVatTuSelected}
        refesh={refesh}
        key={KeyViTri}
      />
    </div>
  );
}

export default KhoVatTu;
