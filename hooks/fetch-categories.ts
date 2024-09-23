// hooks/useFetchCategories.ts
import { useQuery } from "react-query";
import { fetchCategories } from "@/app/actions";

const useFetchCategories = () => {
  return useQuery("categories", fetchCategories);
};

export default useFetchCategories;


