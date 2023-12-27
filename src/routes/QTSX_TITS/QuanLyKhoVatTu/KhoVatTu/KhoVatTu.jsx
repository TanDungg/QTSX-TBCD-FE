import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col, Divider } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { map, isEmpty } from "lodash";
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
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import ModalAddViTri from "./ModalAddViTri";

const { EditableRow, EditableCell } = EditableTableRow;

function KhoVatTu({ history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [ListKho, setListKho] = useState([]);
  const [Kho, setKho] = useState("");
  const [ActiveModal, setActiveModal] = useState(false);
  const [SelectedViTri, setSelectedViTri] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getKho();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (keyword, tits_qtsx_CauTrucKho_Id, page) => {
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
    getListData(keyword, Kho, page);
    setSelectedViTri([]);
    setSelectedKeys([]);
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
          setListKho(res.data);
          setKho(res.data[0].id);
          getListData(keyword, res.data[0].id, page);
        } else {
          setListKho([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onSearchVatTu = () => {
    getListData(keyword, Kho, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, Kho, page);
    }
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(keyword, Kho, pagination);
  };

  const { totalRow, pageSize } = data;

  let dataList = reDataForTable(data.splice((vt) => vt.soLuong !== 0));

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, "vị trí");
  };

  const deleteItemAction = (item) => {
    let url = `tits_qtsx_ViTriLuuKhoVatTu/huy-vi-tri-luu-kho-vat-tu?id=${item.tits_qtsx_ChiTietKhoVatTu_Id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "PUT", null, "EDIT", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(keyword, Kho, page);
          setSelectedViTri([]);
          setSelectedKeys([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusCircleOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={() => setActiveModal(true)}
          disabled={
            !SelectedViTri.length ||
            (SelectedViTri.length && SelectedViTri[0].tits_qtsx_Ke_Id)
          }
        >
          Thêm vị trí
        </Button>
        <Button
          icon={<EditOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={() => setActiveModal(true)}
          disabled={
            !SelectedViTri.length ||
            (SelectedViTri.length && !SelectedViTri[0].tits_qtsx_Ke_Id)
          }
        >
          Chỉnh sửa vị trí
        </Button>
        <Button
          icon={<DeleteOutlined />}
          className="th-margin-bottom-0"
          type="danger"
          onClick={() => deleteItemFunc(SelectedViTri[0])}
          disabled={
            !SelectedViTri.length ||
            (SelectedViTri.length && !SelectedViTri[0].tits_qtsx_Ke_Id)
          }
        >
          Xóa vị trí
        </Button>
      </>
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

  const handleOnSelectKho = (val) => {
    setKho(val);
    setPage(1);
    getListData(keyword, val, 1);
    setSelectedViTri([]);
    setSelectedKeys([]);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedViTri,

    onChange: (selectedRowKeys, selectedRows) => {
      const row =
        SelectedViTri.length > 0
          ? selectedRows.filter((d) => d.key !== SelectedViTri[0].key)
          : [...selectedRows];

      const key =
        SelectedKeys.length > 0
          ? selectedRowKeys.filter((d) => d !== SelectedKeys[0])
          : [...selectedRowKeys];

      setSelectedViTri(row);
      setSelectedKeys(key);
    },
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Kho vật tư"
        description="Kho vật tư"
        buttons={addButtonRender()}
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
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1000, y: "55vh" }}
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
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            hideSelectAll: true,
            preserveSelectedRowKeys: false,
            selectedRowKeys: SelectedKeys,
          }}
        />
      </Card>
      <ModalAddViTri
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        itemData={SelectedViTri[0]}
        refesh={refesh}
      />
    </div>
  );
}

export default KhoVatTu;
