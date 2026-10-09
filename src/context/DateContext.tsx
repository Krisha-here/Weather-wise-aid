import React, { createContext, useContext, useState } from "react";

interface DateContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DateContext = createContext<DateContextType>({
  selectedDate: new Date(),
  setSelectedDate: () => {},
});

export const useDateContext = () => useContext(DateContext);

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
};
