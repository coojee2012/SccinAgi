
CC  = gcc
CCC = g++

c_sources = \
	$(CURDIR)/ttscon_utils.cpp \
	$(CURDIR)/ttscon.cpp

OBJ = $(c_sources:.cpp=.o)

PG = -fomit-frame-pointer


#realse/debug
OPTIM = -g

ifdef release
	OPTIM = -O3
endif

REQUIRED = -D_DEBUG -D_GNU_SOURCE


ARCH = -march=pentium

INCLUDE   = -I$(CURDIR)/../../../include
WARNINGS  = -w
FLAGS_OBJ = -fpermissive -m32
FLAGS_EXE = -lpthread -ldl
WARNINGS2 = -Wstrict-prototypes -Wmissing-prototypes -Wunused -Wunused-function -Wunused-label -Wunused-parameter -Wunused-variable -Wunused-value -Wredundant-decls

NEW_02L_FIXES = -DNEWENCODE -DNEWATAN

CC_SWITCHES = $(OPTIM) $(REQUIRED) $(ARCH) $(PG) $(TWEAKS) $(INCLUDE) $(FLAGS_OBJ) $(WARNINGS) $(NEW_02L_FIXES)

#exe name
PGM = ttscon


UNAME = $(shell uname)
ifeq ($(UNAME),OS/2)
   SHELL=sh     
   PGM = ttscon
   PG = -Zcrtdll -Zexe
   FLAGS_EXE =
endif

%.o: %.c Makefile
	$(CC) $(CC_SWITCHES) -c $< -o $@
	
%.o: %.cpp Makefile
	echo $<
	$(CCC) $(CC_SWITCHES) -c $< -o $@

$(PGM):	$(OBJ) Makefile
	$(CCC) $(PG) -o $(PGM) $(OBJ) $(FLAGS_EXE)

#clean
clean:
	@rm -f $(OBJ) $(PGM) $(DEP)

tags: TAGS

TAGS: ${c_sources}
	etags -T ${c_sources}
