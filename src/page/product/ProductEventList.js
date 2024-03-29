import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Image,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { Recent } from "../../component/RecentViewed";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import * as PropTypes from "prop-types";

function PageButton({ variant, pageNumber, children }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  function handleClick() {
    params.set("p", pageNumber);
    navigate("?" + params);
  }

  return (
    <Button variant={variant} onClick={handleClick}>
      {children}
    </Button>
  );
}

function Pagination({ pageInfo }) {
  const navigate = useNavigate();
  const pageNumbers = [];

  if (!pageInfo) {
    // pageInfo가 null이면 빈 배열을 반환하여 렌더링하지 않음
    return null;
  }

  for (let i = pageInfo.startPageNumber; i <= pageInfo.endPageNumber; i++) {
    pageNumbers.push(i);
  }

  return (
    <Box mb={10} mt={6} display={"flex"} justifyContent={"center"}>
      {pageInfo.prevPageNumber && (
        <PageButton variant="ghost" pageNumber={pageInfo.prevPageNumber}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </PageButton>
      )}

      {pageNumbers.map((pageNumber) => (
        <PageButton
          key={pageNumber}
          variant={
            pageNumber === pageInfo.currentPageNumber ? "solid" : "ghost"
          }
          pageNumber={pageNumber}
        >
          {pageNumber}
        </PageButton>
      ))}

      {pageInfo.nextPageNumber && (
        <PageButton variant="ghost" pageNumber={pageInfo.nextPageNumber}>
          <FontAwesomeIcon icon={faAngleRight} />
        </PageButton>
      )}
    </Box>
  );
}

export function ProductEventList() {
  const [productList, setProductList] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [hoveredBoardId, setHoveredBoardId] = useState(null); // 메인이미지 변경 상태

  const navigate = useNavigate();

  const [params] = useSearchParams();

  const location = useLocation();

  useEffect(() => {
    axios.get("/api/eventProduct/list?" + params).then((response) => {
      setProductList(response.data.product);
      setPageInfo(response.data.pageInfo);
    });
  }, [location]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR", { style: "decimal" }).format(price);
  };

  return (
    <Box mt={10}>
      <Box w={"70%"} ml={"15%"} mt={10}>
        <Text fontSize={"2rem"} fontWeight={"bold"}>
          할인 & 이벤트
        </Text>
      </Box>
      <Box
        w={"85%"}
        ml={"12.5%"}
        mt={4}
        borderBottom={"10px solid black"}
      ></Box>
      <Box
        w={"85%"}
        ml={"12.5%"}
        mt={0}
        borderBottom={"4px solid orange"}
      ></Box>
      <Flex
        mx="10%"
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <SimpleGrid h={"100%"} w={"100%"} columns={4} spacing={9} m={10}>
          {productList.map((product, index) => (
            <Box
              shadow={"1px 1px 3px 1px #dadce0"}
              key={index}
              onMouseEnter={() => {
                // 호버 상태 변경 전에 두 번째 이미지 존재 여부 확인
                if (product.mainImgs && product.mainImgs.length > 1) {
                  setHoveredBoardId(product.product_id);
                }
              }}
              onMouseLeave={() => setHoveredBoardId(null)}
              borderRadius={0}
              _hover={{
                cursor: "pointer",
                // transform: "scale(1.05)",
                // transition: "transform 0.2s",
              }}
              overflow="hidden"
              onClick={() => navigate("/product/" + product.product_id)}
              border={"1px solid #E8E8E8"}
              alignItems={"center"}
              h={"100%"}
            >
              <Box
                position="relative"
                p={5}
                height="250px"
                width="100%"
                bg="white"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                {/* 마우스 호버 시 2번째 이미지로 변경 */}
                {/* 기본 이미지 */}
                <Image
                  className="product-image"
                  position="absolute"
                  src={product.mainImgs[0]?.main_img_uri}
                  alt="Board Image"
                  width="100%"
                  height="100%"
                  zIndex={1}
                  transition="opacity 0.5s ease-in-out"
                  opacity={product.id === hoveredBoardId ? 0 : 1}
                />
                {/* 호버 시 이미지 */}
                <Image
                  className="product-image"
                  position="absolute"
                  src={product.mainImgs[1]?.main_img_uri}
                  alt="Hover Image"
                  width="100%"
                  height="100%"
                  zIndex={2}
                  transition="opacity 0.5s ease-in-out"
                  opacity={product.product_id === hoveredBoardId ? 1 : 0}
                />
              </Box>

              <Flex direction="column" p={4} justifyContent={"center"}>
                <Text>
                  [{product.company_name}] {product.product_name}
                </Text>
                <Text mt={2} fontWeight={"bold"} fontSize={"1.2rem"}>
                  {formatPrice(product.product_price)}원
                </Text>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      </Flex>
      <Box
        display="flex"
        flexDir="column"
        justifyContent="center"
        textAlign="center"
        w="full"
        h="50vh"
        opacity={0.4}
        zIndex={5}
      >
        <Heading size="md">진행중인 이벤트가 없습니다.</Heading>
      </Box>
      <Pagination pageInfo={pageInfo} />
    </Box>
  );
}
