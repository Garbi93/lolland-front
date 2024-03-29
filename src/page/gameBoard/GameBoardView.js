import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Center,
  Divider,
  HStack,
  Spinner,
  Image,
  useToast,
  VStack,
  Heading,
  Text,
  Spacer,
  Flex,
  Badge,
  AccordionPanel,
  AccordionIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  TabPanel,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  Card,
  Table,
  Th,
  Tr,
  TableCaption,
  Tbody,
  Td,
  TableContainer,
  Textarea,
} from "@chakra-ui/react";
import GameBoardCommentContainer from "./GameBoardCommentContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as emptyHeart } from "@fortawesome/free-regular-svg-icons";
import {
  faComments,
  faEye,
  faHeart as fullHeart,
  faThumbsDown,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { LoginContext } from "../../component/LoginProvider";
import { useNavigate, useParams } from "react-router-dom";

async function fetchBoardData(
  id,
  setBoard,
  setLike,
  setWritten,
  setWriterInfo,
  setWrittenComment,
) {
  try {
    const boardResponse = await axios.get(`/api/gameboard/id/${id}`);
    setBoard(boardResponse.data);

    const likeResponse = await axios.get(`/api/like/gameboard/${id}`);
    setLike(likeResponse.data);

    if (boardResponse.data !== null) {
      const writtenResponse = await axios.get(
        `/api/gameboard/list/written/post/${boardResponse.data.member_id}`,
      );
      setWritten(writtenResponse.data);

      const writerInfoResponse = await axios.get(
        `/api/gameboard/list/info/${boardResponse.data.member_id}`,
      );
      setWriterInfo(writerInfoResponse.data);

      const writtenCommentResponse = await axios.get(
        `/api/comment/list/written/comment/${boardResponse.data.member_id}`,
      );
      setWrittenComment(writtenCommentResponse.data);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function LikeContainer({ like, onClick }) {
  const { isAuthenticated } = useContext(LoginContext);

  if (like === null) {
    return <Spinner />;
  }

  return (
    <HStack spacing={2} align="center">
      <Button
        variant="outline"
        colorScheme="blue"
        size="md"
        onClick={onClick}
        isDisabled={!isAuthenticated()}
      >
        {like.like ? (
          <FontAwesomeIcon icon={faThumbsUp} />
        ) : (
          <FontAwesomeIcon icon={faThumbsDown} />
        )}
        {"  "}
        추천 {"  "}
        {like.countLike}
      </Button>
    </HStack>
  );
}

export function GameBoardView() {
  const [board, setBoard] = useState(null);
  const [like, setLike] = useState(null);
  const [written, setWritten] = useState(null);
  const [writerInfo, setWriterInfo] = useState(null);
  const [writtenComment, setWrittenComment] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, hasAccess, isAdmin } = useContext(LoginContext);

  useEffect(() => {
    const fetchData = async () => {
      await fetchBoardData(
        id,
        setBoard,
        setLike,
        setWritten,
        setWriterInfo,
        setWrittenComment,
      );
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/gameboard/remove/${id}`);
      toast({
        description: `${id}번 게시물 삭제 완료`,
        status: "success",
      });
      navigate(-1);
    } catch (error) {
      toast({
        description: "실패",
        status: "error",
      });
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post("/api/like", {
        game_board_id: board.id,
      });
      setLike(response.data);
    } catch (error) {
      toast({
        description: "로그인 후 이용 해주세요.",
        status: "error",
      });
    } finally {
      console.log("done");
    }
  };

  if (board === null) {
    return <Spinner />;
  }

  return (
    <Center>
      <VStack spacing={6} align="start" w="50%" px={4}>
        <HStack spacing={2} w="100%" justify="space-between">
          <Button onClick={() => navigate(-1)}>이전</Button>
          <Spacer />

          {(hasAccess(board.member_id) || isAdmin()) && (
            <>
              <Button
                colorScheme="purple"
                onClick={() => navigate(`/gameboard/edit/${id}`)}
              >
                수정
              </Button>
              <Button onClick={handleDelete} colorScheme="red">
                삭제
              </Button>
            </>
          )}
        </HStack>
        <Flex w="100%" justify="space-between">
          <Heading size="xl">{board.title}</Heading>
          <Spacer />
          <LikeContainer like={like} onClick={handleLike} />
        </Flex>
        <Divider />
        <HStack spacing={2} w="100%" justify="space-between">
          <Text fontSize="md" fontWeight="bold">
            작성자: {board.member_id}
          </Text>
          <Badge>
            <FontAwesomeIcon icon={faComments} />
            {board.count_comment}
          </Badge>
          <Badge>
            <FontAwesomeIcon icon={faEye} />
            {board.board_count}
          </Badge>
          <Spacer />
          <Text fontSize="md" fontWeight="bold">
            작성일: {new Date(board.reg_time).toLocaleString()}
          </Text>
        </HStack>

        <Divider my={4} />
        <Text fontSize="lg">{board.board_content}</Text>
        {board.files.map((file) => (
          <Image
            key={file.id}
            src={file.file_url}
            alt={file.file_name}
            borderRadius="md"
            boxSize="100%"
            my={4}
          />
        ))}

        <Accordion allowMultiple w="100%" as="span" isLazy defaultIndex={[0]}>
          <AccordionItem>
            <h2>
              <AccordionButton _expanded={{ bg: "whitesmoke", color: "black" }}>
                <Box
                  as="span"
                  flex="1"
                  textAlign="left"
                  width="100%"
                  paddingX={2}
                  paddingY={2}
                  fontSize={"1.2rem"}
                  fontWeight={"bold"}
                >
                  {board.member_id}의 정보
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              {writerInfo && (
                <Flex
                  gap="20px"
                  alignItems="center"
                  justifyContent="space-evenly"
                >
                  <Image
                    borderRadius="full"
                    boxSize="200px"
                    src={writerInfo.file_url}
                    alt="프로필 이미지"
                  />

                  <VStack align="start">
                    <Text fontSize="1.2rem" fontWeight="bold">
                      {writerInfo.member_name}
                    </Text>
                    <Text fontSize="md">
                      <strong>이메일:</strong> {writerInfo.member_email}
                    </Text>
                    <Text fontSize="md">
                      <strong>연락처:</strong> {writerInfo.member_phone_number}
                    </Text>
                    <Box>
                      <Text fontSize="md">
                        <strong>자기소개:</strong>
                      </Text>
                      <Textarea
                        value={writerInfo.member_introduce}
                        isReadOnly
                        size="sm"
                        width="300px"
                        fontSize="1.1rem"
                        mb="20px"
                        h={"120px"}
                      />
                    </Box>
                  </VStack>
                </Flex>
              )}

              <Tabs isFitted variant="enclosed" mt={"30px"}>
                <TabList mb="1em">
                  <Tab fontSize={"1.2rem"}>최근 글</Tab>
                  <Tab fontSize={"1.2rem"}>최근 댓글</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    {written && (
                      <Table variant="simple">
                        <TableCaption></TableCaption>
                        <Tbody>
                          {written.map((posties) => (
                            <Tr
                              fontSize={"1.1rem"}
                              key={posties.id}
                              onClick={() => {
                                navigate(`/gameboard/id/${posties.id}`);
                                window.scrollTo(0, 0);
                              }}
                              _hover={{ cursor: "pointer" }}
                            >
                              <Box
                                p={4}
                                borderWidth="1px"
                                borderRadius="md"
                                boxShadow="sm"
                                onClick={() => {
                                  navigate(`/gameboard/id/${posties.id}`);
                                  window.scrollTo(0, 0);
                                }}
                                _hover={{ cursor: "pointer", bg: "gray.100" }}
                              >
                                {posties.title}
                              </Box>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    )}
                  </TabPanel>
                  <TabPanel>
                    {writtenComment && (
                      <Table variant="simple">
                        <TableCaption></TableCaption>
                        <Tbody>
                          {writtenComment.map((comment) => (
                            <Tr
                              fontSize={"1.1rem"}
                              key={comment.id}
                              onClick={() => {
                                navigate(
                                  `/gameboard/id/${comment.game_board_id}`,
                                );
                                window.scrollTo({
                                  top: document.body.scrollHeight,
                                  behavior: "smooth",
                                });
                              }}
                              _hover={{ cursor: "pointer" }}
                            >
                              <Box
                                p={4}
                                borderWidth="1px"
                                borderRadius="md"
                                boxShadow="sm"
                                onClick={() => {
                                  navigate(
                                    `/gameboard/id/${comment.game_board_id}`,
                                  );
                                  window.scrollTo({
                                    top: document.body.scrollHeight,
                                    behavior: "smooth",
                                  });
                                }}
                                _hover={{ cursor: "pointer", bg: "gray.100" }}
                              >
                                {comment.comment_content}
                              </Box>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <GameBoardCommentContainer />
      </VStack>
    </Center>
  );
}

export default GameBoardView;
